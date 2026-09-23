import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

import { AppShell, EmptyState, PageTitle } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Field, SelectInput, TextArea, TextInput } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { addItem, patchItem, relativeTime, removeItem, uid, useData, type QuickNote } from "@/lib/store";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — Writer Idea Booster" },
      { name: "description", content: "Quick notes and stray ideas, optionally attached to one of your books." },
      { property: "og:title", content: "Notes — Writer Idea Booster" },
      {
        property: "og:description",
        content: "Quick notes and stray ideas, optionally attached to one of your books.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const data = useData();
  const [draft, setDraft] = useState<QuickNote | null>(null);
  const [isNew, setIsNew] = useState(false);

  const notes = [...data.notes].sort((a, b) => b.updatedAt - a.updatedAt);

  function openNew() {
    setDraft({ id: uid(), title: "", content: "", bookId: null, updatedAt: Date.now() });
    setIsNew(true);
  }

  function save() {
    if (!draft) return;
    const note = { ...draft, title: draft.title.trim() || "Untitled note", updatedAt: Date.now() };
    if (isNew) addItem("notes", note);
    else patchItem("notes", note.id, note);
    setDraft(null);
  }

  return (
    <AppShell>
      <PageTitle
        title="Notes"
        subtitle="Catch ideas before they escape."
        action={
          <Btn onClick={openNew} className="py-2">
            <Plus className="size-4" /> New
          </Btn>
        }
      />

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          body="Jot down a line of dialogue, a title, or a thought you don't want to lose."
          action={
            <Btn onClick={openNew}>
              <Plus className="size-4" /> Write a note
            </Btn>
          }
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => {
            const book = data.books.find((b) => b.id === n.bookId);
            return (
              <article key={n.id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="book-title text-base">{n.title}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {book ? `${book.title} · ` : ""}
                      {relativeTime(n.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      aria-label="Edit note"
                      onClick={() => {
                        setDraft(n);
                        setIsNew(false);
                      }}
                      className="p-2 text-muted-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <ConfirmDelete
                      title="Delete this note?"
                      description="This note will be permanently removed."
                      onConfirm={() => removeItem("notes", n.id)}
                      trigger={(open) => (
                        <button aria-label="Delete note" onClick={open} className="p-2 text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    />
                  </div>
                </div>
                {n.content ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{n.content}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={!!draft}
        title={isNew ? "New note" : "Edit note"}
        onClose={() => setDraft(null)}
        footer={
          <Btn className="w-full" onClick={save}>
            Save note
          </Btn>
        }
      >
        {draft ? (
          <>
            <Field label="Title">
              <TextInput
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Note title"
              />
            </Field>
            <Field label="Content">
              <TextArea
                rows={8}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                placeholder="Write it down…"
              />
            </Field>
            <Field label="Related book (optional)">
              <SelectInput
                value={draft.bookId ?? ""}
                onChange={(e) => setDraft({ ...draft, bookId: e.target.value || null })}
              >
                <option value="">No book</option>
                {data.books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </>
        ) : null}
      </Modal>
    </AppShell>
  );
}
