import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Field, TextArea, TextInput } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { NAME_LIST_KEYS, randomName, type NameListKey } from "@/lib/names";
import { addItem, newCharacter, patchItem, removeItem, useData, type Character } from "@/lib/store";

export const Route = createFileRoute("/books/$bookId/characters")({
  head: () => ({
    meta: [
      { title: "Characters — Writer Idea Booster" },
      { name: "description", content: "Develop characters: goals, motivation, fears, strengths, flaws and arcs." },
      { property: "og:title", content: "Characters — Writer Idea Booster" },
      {
        property: "og:description",
        content: "Develop characters: goals, motivation, fears, strengths, flaws and arcs.",
      },
    ],
  }),
  component: CharactersPage,
});

const fields: Array<{ key: keyof Omit<Character, "id" | "bookId">; label: string; area?: boolean }> = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "description", label: "Description", area: true },
  { key: "personality", label: "Personality", area: true },
  { key: "goal", label: "Goal", area: true },
  { key: "motivation", label: "Motivation", area: true },
  { key: "fear", label: "Fear", area: true },
  { key: "strengths", label: "Strengths", area: true },
  { key: "weaknesses", label: "Weaknesses", area: true },
  { key: "background", label: "Background", area: true },
  { key: "arc", label: "Character arc", area: true },
  { key: "notes", label: "Notes", area: true },
];

function CharactersPage() {
  const { bookId } = Route.useParams();
  const data = useData();
  const list = data.characters.filter((c) => c.bookId === bookId);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Character>(() => newCharacter(bookId));
  const [isNew, setIsNew] = useState(true);
  const [nameList, setNameList] = useState<NameListKey>("First names");

  const set = (k: keyof Character, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    setForm(newCharacter(bookId));
    setIsNew(true);
    setOpen(true);
  };

  const startEdit = (c: Character) => {
    setForm(c);
    setIsNew(false);
    setOpen(true);
  };

  const save = () => {
    const payload = { ...form, name: form.name.trim() || "Unnamed character" };
    if (isNew) addItem("characters", payload);
    else patchItem("characters", payload.id, payload);
    setOpen(false);
  };

  return (
    <div>
      <Btn onClick={startNew} className="mb-4 w-full">
        <Plus className="size-4" /> Add character
      </Btn>

      {list.length === 0 ? (
        <EmptyState title="No characters yet" body="Who carries this story? Add them and fill in what drives them." />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <button onClick={() => startEdit(c)} className="min-w-0 flex-1 text-left">
                <h3 className="book-title text-base">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.role || "No role set"}</p>
                {c.goal ? <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">Wants: {c.goal}</p> : null}
              </button>
              <ConfirmDelete
                title="Delete character?"
                description={`${c.name} will be removed from this book.`}
                onConfirm={() => removeItem("characters", c.id)}
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
        title={isNew ? "New character" : "Edit character"}
        onClose={() => setOpen(false)}
        footer={
          <Btn onClick={save} className="w-full">
            Save character
          </Btn>
        }
      >
        <div className="rounded-xl bg-secondary p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">Need a name?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {NAME_LIST_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setNameList(k)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  k === nameList ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {randomName(nameList, 4).map((n) => (
              <button
                key={n}
                onClick={() => set("name", n)}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {fields.map((f) => (
          <Field key={f.key} label={f.label}>
            {f.area ? (
              <TextArea value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <TextInput value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </Field>
        ))}
      </Modal>
    </div>
  );
}
