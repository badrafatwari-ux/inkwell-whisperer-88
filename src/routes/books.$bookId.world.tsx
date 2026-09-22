import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Field, SelectInput, TextArea, TextInput } from "@/components/Field";
import { Modal } from "@/components/Modal";
import {
  WORLD_CATEGORIES,
  addItem,
  newWorldNote,
  patchItem,
  removeItem,
  useData,
  type WorldCategory,
  type WorldNote,
} from "@/lib/store";

export const Route = createFileRoute("/books/$bookId/world")({
  head: () => ({
    meta: [
      { title: "World Building — Writer Idea Booster" },
      { name: "description", content: "Capture history, culture, rules, geography, technology and key events." },
      { property: "og:title", content: "World Building — Writer Idea Booster" },
      {
        property: "og:description",
        content: "Capture history, culture, rules, geography, technology and key events.",
      },
    ],
  }),
  component: WorldPage,
});

function WorldPage() {
  const { bookId } = Route.useParams();
  const data = useData();
  const list = data.world.filter((w) => w.bookId === bookId);

  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState<WorldNote>(() => newWorldNote(bookId));
  const [filter, setFilter] = useState<"All" | WorldCategory>("All");

  const shown = filter === "All" ? list : list.filter((w) => w.category === filter);

  const save = () => {
    const payload = { ...form, title: form.title.trim() || "Untitled note" };
    if (isNew) addItem("world", payload);
    else patchItem("world", payload.id, payload);
    setOpen(false);
  };

  return (
    <div>
      <Btn
        onClick={() => {
          setForm(newWorldNote(bookId));
          setIsNew(true);
          setOpen(true);
        }}
        className="mb-4 w-full"
      >
        <Plus className="size-4" /> Add world note
      </Btn>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {(["All", ...WORLD_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${
              c === filter ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title="Nothing here yet" body="Note the history, rules and culture your story quietly relies on." />
      ) : (
        <div className="space-y-3">
          {shown.map((w) => (
            <div key={w.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <button
                onClick={() => {
                  setForm(w);
                  setIsNew(false);
                  setOpen(true);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-xs text-muted-foreground">{w.category}</p>
                <h3 className="book-title text-base">{w.title}</h3>
                {w.content ? <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{w.content}</p> : null}
              </button>
              <ConfirmDelete
                title="Delete world note?"
                description={`"${w.title}" will be removed from this book.`}
                onConfirm={() => removeItem("world", w.id)}
                trigger={(openDialog) => (
                  <button aria-label="Delete" onClick={openDialog} className="p-1 text-muted-foreground">
                    <Trash2 className="size-4" />
                  </button>
                )}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={isNew ? "New world note" : "Edit world note"}
        onClose={() => setOpen(false)}
        footer={
          <Btn onClick={save} className="w-full">
            Save note
          </Btn>
        }
      >
        <Field label="Category">
          <SelectInput
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as WorldCategory }))}
          >
            {WORLD_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Title">
          <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="Content">
          <TextArea
            rows={8}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
        </Field>
      </Modal>
    </div>
  );
}
