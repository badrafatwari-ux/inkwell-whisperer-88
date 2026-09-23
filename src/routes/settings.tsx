import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Upload, FileText } from "lucide-react";

import { AppShell, PageTitle } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { bookChapters, getData, replaceAll, useData, type AppData } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Backup — Writer Idea Booster" },
      { name: "description", content: "Export and import your writing data as a JSON backup, fully offline." },
      { property: "og:title", content: "Backup — Writer Idea Booster" },
      {
        property: "og:description",
        content: "Export and import your writing data as a JSON backup, fully offline.",
      },
    ],
  }),
  component: SettingsPage,
});

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SettingsPage() {
  const data = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  function exportAll() {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`writer-backup-${stamp}.json`, JSON.stringify(getData(), null, 2), "application/json");
    setStatus("Backup file created.");
  }

  function exportBook(bookId: string) {
    const book = data.books.find((b) => b.id === bookId);
    if (!book) return;
    const chapters = bookChapters(data, bookId);
    const body = [
      book.title,
      book.genre ? `Genre: ${book.genre}` : "",
      book.description ? `\n${book.description}` : "",
      "",
      ...chapters.map((c) => `\n\n${c.number}. ${c.title}\n\n${c.content || "(empty)"}`),
    ]
      .filter(Boolean)
      .join("\n");
    download(`${book.title.replace(/[^\w\- ]+/g, "").trim() || "book"}.txt`, body, "text/plain");
  }

  function importFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.books)) {
          throw new Error("bad file");
        }
        replaceAll(parsed);
        setStatus("Backup restored successfully.");
      } catch {
        setStatus("That file doesn't look like a valid backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <AppShell>
      <PageTitle title="Backup" subtitle="Your work lives on this device. Keep a copy somewhere safe." />

      <section className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="book-title text-lg">Full backup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Books, chapters, characters, locations, world notes, ideas and notes in one file.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Btn onClick={exportAll}>
            <Download className="size-4" /> Export
          </Btn>
          <Btn variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Import
          </Btn>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFile(f);
            e.target.value = "";
          }}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Importing replaces everything currently stored on this device.
        </p>
        {status ? <p className="mt-2 text-sm font-medium text-primary">{status}</p> : null}
      </section>

      <section className="rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="book-title text-lg">Export a book as text</h2>
        {data.books.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">You don't have any books yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.books.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2">
                <span className="min-w-0 truncate text-sm font-medium">{b.title}</span>
                <button
                  onClick={() => exportBook(b.id)}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
                >
                  <FileText className="size-4" /> .txt
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
