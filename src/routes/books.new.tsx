import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { Field, SelectInput, TextArea, TextInput } from "@/components/Field";
import { BOOK_STATUSES, createBook, type BookStatus } from "@/lib/store";

export const Route = createFileRoute("/books/new")({
  head: () => ({
    meta: [
      { title: "New Book — Writer Idea Booster" },
      { name: "description", content: "Start a new book: title, genre, theme, tone and word-count target." },
      { property: "og:title", content: "New Book — Writer Idea Booster" },
      { property: "og:description", content: "Start a new book: title, genre, theme, tone and word-count target." },
    ],
  }),
  component: NewBookPage,
});

function NewBookPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    genre: "",
    description: "",
    theme: "",
    tone: "",
    targetWords: "50000",
    status: "Idea" as BookStatus,
    notes: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const book = createBook({
      ...form,
      targetWords: Number(form.targetWords) || 0,
    });
    navigate({ to: "/books/$bookId", params: { bookId: book.id } });
  };

  return (
    <AppShell>
      <button onClick={() => navigate({ to: "/books" })} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="size-4" /> Books
      </button>
      <h1 className="book-title mb-5 text-2xl">New book</h1>

      <div className="space-y-4 rounded-2xl bg-card p-4 shadow-sm">
        <Field label="Title">
          <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Untitled Book" />
        </Field>
        <Field label="Genre">
          <TextInput value={form.genre} onChange={(e) => set("genre", e.target.value)} placeholder="Literary fiction" />
        </Field>
        <Field label="Description">
          <TextArea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this book about?" />
        </Field>
        <Field label="Theme">
          <TextInput value={form.theme} onChange={(e) => set("theme", e.target.value)} placeholder="Grief and second chances" />
        </Field>
        <Field label="Tone">
          <TextInput value={form.tone} onChange={(e) => set("tone", e.target.value)} placeholder="Warm, wry, quietly tense" />
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

      <Btn onClick={submit} className="mt-5 w-full">
        Create book
      </Btn>
    </AppShell>
  );
}
