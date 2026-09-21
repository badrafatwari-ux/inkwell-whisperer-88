import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppShell, EmptyState, PageTitle } from "@/components/AppShell";
import { LinkBtn } from "@/components/Btn";
import { bookProgress, relativeTime, useData } from "@/lib/store";

export const Route = createFileRoute("/books/")({
  head: () => ({
    meta: [
      { title: "My Books — Writer Idea Booster" },
      { name: "description", content: "All your books, plans and drafts, stored offline on your device." },
      { property: "og:title", content: "My Books — Writer Idea Booster" },
      { property: "og:description", content: "All your books, plans and drafts, stored offline on your device." },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const data = useData();
  const books = [...data.books].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <AppShell>
      <PageTitle
        title="My Books"
        subtitle={`${books.length} ${books.length === 1 ? "book" : "books"} on the shelf`}
        action={
          <LinkBtn to="/books/new" className="px-3 py-2">
            <Plus className="size-4" /> New
          </LinkBtn>
        }
      />

      {books.length === 0 ? (
        <EmptyState
          title="No books yet"
          body="Create a book to collect its outline, characters, locations and chapters in one place."
          action={
            <LinkBtn to="/books/new">
              <Plus className="size-4" /> Create a book
            </LinkBtn>
          }
        />
      ) : (
        <div className="space-y-3">
          {books.map((book) => {
            const p = bookProgress(data, book.id);
            return (
              <Link
                key={book.id}
                to="/books/$bookId"
                params={{ bookId: book.id }}
                className="block rounded-2xl bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="book-title text-base">{book.title}</h3>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                    {book.status}
                  </span>
                </div>
                {book.description ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{book.description}</p>
                ) : null}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{book.genre || "No genre"}</span>
                  <span>
                    {p.words.toLocaleString()} words · {p.completed}/{p.chapters} ch · {relativeTime(book.updatedAt)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.percent}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
