import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PenLine, Pencil, Trash2 } from "lucide-react";

import { Btn, LinkBtn } from "@/components/Btn";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import {
  bookChapters,
  bookProgress,
  deleteBook,
  relativeTime,
  useData,
} from "@/lib/store";

export const Route = createFileRoute("/books/$bookId/")({
  head: () => ({
    meta: [
      { title: "Book Overview — Writer Idea Booster" },
      { name: "description", content: "Overview of your book: progress, premise, theme, tone and notes." },
      { property: "og:title", content: "Book Overview — Writer Idea Booster" },
      { property: "og:description", content: "Overview of your book: progress, premise, theme, tone and notes." },
    ],
  }),
  component: BookOverview,
});

function BookOverview() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const data = useData();
  const book = data.books.find((b) => b.id === bookId);
  if (!book) return null;

  const p = bookProgress(data, bookId);
  const chapters = bookChapters(data, bookId);
  const next = chapters.find((c) => c.status !== "Completed") ?? chapters[0];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex items-end justify-between text-sm">
          <span className="book-title text-xl">{p.words.toLocaleString()} words</span>
          <span className="text-muted-foreground">
            {p.target ? `of ${p.target.toLocaleString()}` : "no target set"}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${p.percent}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div>
            <div className="book-title text-base text-foreground">{p.chapters}</div>
            chapters
          </div>
          <div>
            <div className="book-title text-base text-foreground">{p.completed}</div>
            completed
          </div>
          <div>
            <div className="book-title text-base text-foreground">{p.percent}%</div>
            of target
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {next ? (
          <LinkBtn to="/write/$bookId/$chapterId" params={{ bookId, chapterId: next.id }}>
            <PenLine className="size-4" /> Write
          </LinkBtn>
        ) : (
          <LinkBtn to="/books/$bookId/chapters" params={{ bookId }}>
            <PenLine className="size-4" /> Add chapter
          </LinkBtn>
        )}
        <LinkBtn to="/books/$bookId/edit" params={{ bookId }} variant="outline">
          <Pencil className="size-4" /> Edit details
        </LinkBtn>
      </div>

      <section className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
        <Detail label="Description" value={book.description} />
        <Detail label="Theme" value={book.theme} />
        <Detail label="Tone" value={book.tone} />
        <Detail label="Notes" value={book.notes} />
        <p className="pt-1 text-xs text-muted-foreground">Last updated {relativeTime(book.updatedAt)}</p>
      </section>

      <ConfirmDelete
        title="Delete this book?"
        description="This permanently removes the book and all its chapters, characters, locations and world notes from this device."
        onConfirm={() => {
          deleteBook(bookId);
          navigate({ to: "/books" });
        }}
        trigger={(open) => (
          <Btn variant="outline" onClick={open} className="w-full text-destructive">
            <Trash2 className="size-4" /> Delete book
          </Btn>
        )}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {value?.trim() ? value : <span className="text-muted-foreground">Not set yet.</span>}
      </p>
    </div>
  );
}
