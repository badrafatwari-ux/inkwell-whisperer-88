import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Field, TextArea, TextInput } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { addItem, newOutlineItem, patchItem, removeItem, useData, type OutlineItem } from "@/lib/store";

export const Route = createFileRoute("/books/$bookId/outline")({
  head: () => ({
    meta: [
      { title: "Outline — Writer Idea Booster" },
      { name: "description", content: "Build your book's outline: beats, acts and scene summaries." },
      { property: "og:title", content: "Outline — Writer Idea Booster" },
      { property: "og:description", content: "Build your book's outline: beats, acts and scene summaries." },
    ],
  }),
  component: OutlinePage,
});

function OutlinePage() {
  const { bookId } = Route.useParams();
  const data = useData();
  const items = data.outline.filter((o) => o.bookId === bookId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OutlineItem | null>(null);
  const [form, setForm] = useState({ title: "", summary: "", notes: "" });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setEditing(null);
    setForm({ title: "", summary: "", notes: "" });
    setOpen(true);
  };

  const startEdit = (o: OutlineItem) => {
    setEditing(o);
    setForm({ title: o.title, summary: o.summary, notes: o.notes });
    setOpen(true);
  };

  const save = () => {
    if (editing) patchItem("outline", editing.id, form);
    else addItem("outline", { ...newOutlineItem(bookId), ...form, title: form.title || "Untitled beat" });
    setOpen(false);
  };

  return (
    <div>
      <Btn onClick={startNew} className="mb-4 w-full">
        <Plus className="size-4" /> Add outline point
      </Btn>

      {items.length === 0 ? (
        <EmptyState title="No outline yet" body="Sketch the big beats first — you can rearrange them into chapters later." />
      ) : (
        <ol className="space-y-3">
          {items.map((o, i) => (
            <li key={o.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <button onClick={() => startEdit(o)} className="min-w-0 flex-1 text-left">
                  <p className="text-xs text-muted-foreground">Point {i + 1}</p>
                  <h3 className="book-title text-base">{o.title}</h3>
                  {o.summary ? <p className="mt-1 text-sm text-muted-foreground">{o.summary}</p> : null}
                </button>
                <ConfirmDelete
                  title="Delete outline point?"
                  description="This removes it from your outline."
                  onConfirm={() => removeItem("outline", o.id)}
                  trigger={(openDialog) => (
                    <button aria-label="Delete" onClick={openDialog} className="p-1 text-muted-foreground">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                />
              </div>
            </li>
          ))}
        </ol>
      )}

      <Modal
        open={open}
        title={editing ? "Edit outline point" : "New outline point"}
        onClose={() => setOpen(false)}
        footer={
          <Btn onClick={save} className="w-full">
            Save
          </Btn>
        }
      >
        <Field label="Title">
          <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="The inciting storm" />
        </Field>
        <Field label="Summary">
          <TextArea value={form.summary} onChange={(e) => set("summary", e.target.value)} />
        </Field>
        <Field label="Notes">
          <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
