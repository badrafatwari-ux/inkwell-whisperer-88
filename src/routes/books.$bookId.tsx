import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/books/$bookId")({
  component: BookLayout,
});

const tabs = [
  { key: "", label: "Overview", to: "/books/$bookId" },
  { key: "chapters", label: "Chapters", to: "/books/$bookId/chapters" },
  { key: "outline", label: "Outline", to: "/books/$bookId/outline" },
  { key: "characters", label: "Characters", to: "/books/$bookId/characters" },
  { key: "locations", label: "Locations", to: "/books/$bookId/locations" },
  { key: "world", label: "World", to: "/books/$bookId/world" },
] as const;

function BookLayout() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const data = useData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const book = data.books.find((b) => b.id === bookId);

  const current = pathname.replace(`/books/${bookId}`, "").replace("/", "");

  if (!book) {
    return (
      <AppShell>
        <div className="rounded-2xl bg-card p-6 text-center">
          <h1 className="book-title text-xl">Book not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been deleted from this device.</p>
          <button onClick={() => navigate({ to: "/books" })} className="mt-4 text-sm font-semibold text-primary">
            Back to books
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <button
        onClick={() => navigate({ to: "/books" })}
        className="mb-3 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> Books
      </button>

      <h1 className="book-title text-2xl leading-tight">{book.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {book.genre || "No genre"} · {book.status}
      </p>

      <div className="-mx-4 mb-5 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {tabs.map((t) => {
          const active = current === t.key;
          return (
            <Link
              key={t.key}
              to={t.key ? `/books/$bookId/${t.key}` : "/books/$bookId"}
              params={{ bookId }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </AppShell>
  );
}
