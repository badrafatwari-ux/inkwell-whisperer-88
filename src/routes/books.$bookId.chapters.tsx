import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, PenLine, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Field, SelectInput, TextArea, TextInput } from "@/components/Field";
import { Modal } from "@/components/Modal";
import {
  CHAPTER_STATUSES,
  bookChapters,
  countWords,
  createChapter,
  deleteChapter,
  moveChapter,
  updateChapter,
  useData,
  type Chapter,
  type ChapterStatus,
} from "@/lib/store";

export const Route = createFileRoute("/books/$bookId/chapters")({
  head: () => ({
    meta: [
      { title: "Chapters — Writer Idea Booster" },
      { name: "description", content: "Plan chapters with goals, conflict, characters, location and word targets." },
      { property: "og:title", content: "Chapters — Writer Idea Booster" },
      {
        property: "og:description",
        content: "Plan chapters with goals, conflict, characters, location and word targets.",
      },
    ],
  }),
  component: ChaptersPage,
});

const blank = {
  title: "",
  summary: "",
  goal: "",
  conflict: "",
  characters: "",
  location: "",
  notes: "",
  targetWords: "1500",
  status: "Idea" as ChapterStatus,
};

function ChaptersPage() {
  const { bookId } = Route.useParams();
  const data = useData();
  const chapters = bookChapters(data, bookId);

  const [editing, setEditing] = useState<Chapter | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setEditing(null);
    setForm({ ...blank, title: `Chapter ${chapters.length + 1}` });
    setOpen(true);
  };

  const startEdit = (c: Chapter) => {
    setEditing(c);
    setForm({
      title: c.title,
      summary: c.summary,
      goal: c.goal,
      conflict: c.conflict,
      characters: c.characters,
      location: c.location,
      notes: c.notes,
      targetWords: String(c.targetWords),
      status: c.status,
    });
    setOpen(true);
  };

  const save = () => {
    const payload = { ...form, targetWords: Number(form.targetWords) || 0 };
    if (editing) updateChapter(editing.id, payload);
    else createChapter(bookId, payload);
    setOpen(false);
  };

  return (
    <div>
      <Btn onClick={startNew} className="mb-4 w-full">
        <Plus className="size-4" /> Add chapter
      </Btn>

      {chapters.length === 0 ? (
        <EmptyState title="No chapters yet" body="Break your book into chapters, then write them one at a time." />
      ) : (
        <div className="space-y-3">
          {chapters.map((c, i) => (
            <div key={c.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Chapter {c.number}</p>
                  <h3 className="book-title text-base">{c.title}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                  {c.status}
                </span>
              </div>

              {c.summary ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.summary}</p>
              ) : null}

              <p className="mt-2 text-xs text-muted-foreground">
                {countWords(c.content).toLocaleString()}
                {c.targetWords ? ` / ${c.targetWords.toLocaleString()}` : ""} words
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  to="/write/$bookId/$chapterId"
                  params={{ bookId, chapterId: c.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <PenLine className="size-3.5" /> Write
                </Link>
                <button
                  onClick={() => startEdit(c)}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-semibold"
                >
                  Plan
                </button>
                <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <button
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => moveChapter(bookId, c.id, -1)}
                    className="p-1.5 disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    aria-label="Move down"
                    disabled={i === chapters.length - 1}
                    onClick={() => moveChapter(bookId, c.id, 1)}
                    className="p-1.5 disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <ConfirmDelete
                    title="Delete chapter?"
                    description={`"${c.title}" and its written text will be removed from this device.`}
                    onConfirm={() => deleteChapter(c.id)}
                    trigger={(openDialog) => (
                      <button aria-label="Delete chapter" onClick={openDialog} className="p-1.5">
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? "Edit chapter" : "New chapter"}
        onClose={() => setOpen(false)}
        footer={
          <Btn onClick={save} className="w-full">
            Save chapter
          </Btn>
        }
      >
        <Field label="Title">
          <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Summary">
          <TextArea value={form.summary} onChange={(e) => set("summary", e.target.value)} />
        </Field>
        <Field label="Chapter goal">
          <TextArea value={form.goal} onChange={(e) => set("goal", e.target.value)} />
        </Field>
        <Field label="Conflict">
          <TextArea value={form.conflict} onChange={(e) => set("conflict", e.target.value)} />
        </Field>
        <Field label="Characters present">
          <TextInput value={form.characters} onChange={(e) => set("characters", e.target.value)} />
        </Field>
        <Field label="Location">
          <TextInput value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <Field label="Target word count">
          <TextInput
            inputMode="numeric"
            value={form.targetWords}
            onChange={(e) => set("targetWords", e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field label="Status">
          <SelectInput value={form.status} onChange={(e) => set("status", e.target.value)}>
            {CHAPTER_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Notes">
          <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
