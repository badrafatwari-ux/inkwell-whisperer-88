import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Btn } from "@/components/Btn";
import { Field, SelectInput, TextArea, TextInput } from "@/components/Field";
import { BOOK_STATUSES, updateBook, useData, type BookStatus } from "@/lib/store";

export const Route = createFileRoute("/books/$bookId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Book — Writer Idea Booster" },
      { name: "description", content: "Update your book's title, genre, theme, tone, target and status." },
      { property: "og:title", content: "Edit Book — Writer Idea Booster" },
      { property: "og:description", content: "Update your book's title, genre, theme, tone, target and status." },
    ],
  }),
  component: EditBookPage,
});

function EditBookPage() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const data = useData();
  const book = data.books.find((b) => b.id === bookId);

  const [form, setForm] = useState(() => ({
    title: book?.title ?? "",
    genre: book?.genre ?? "",
    description: book?.description ?? "",
    theme: book?.theme ?? "",
    tone: book?.tone ?? "",
    targetWords: String(book?.targetWords ?? 0),
    status: (book?.status ?? "Idea") as BookStatus,
    notes: book?.notes ?? "",
  }));

  if (!book) return null;
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    updateBook(bookId, { ...form, targetWords: Number(form.targetWords) || 0 });
    navigate({ to: "/books/$bookId", params: { bookId } });
  };

  return (
    <div>
      <div className="space-y-4 rounded-2xl bg-card p-4 shadow-sm">
        <Field label="Title">
          <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Genre">
          <TextInput value={form.genre} onChange={(e) => set("genre", e.target.value)} />
        </Field>
        <Field label="Description">
          <TextArea value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Theme">
          <TextInput value={form.theme} onChange={(e) => set("theme", e.target.value)} />
        </Field>
        <Field label="Tone">
          <TextInput value={form.tone} onChange={(e) => set("tone", e.target.value)} />
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
            {BOOK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Notes">
          <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Btn variant="outline" onClick={() => navigate({ to: "/books/$bookId", params: { bookId } })}>
          Cancel
        </Btn>
        <Btn onClick={save}>Save changes</Btn>
      </div>
    </div>
  );
}
