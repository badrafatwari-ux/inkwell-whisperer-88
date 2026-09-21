import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, PenLine, Plus, Sparkles, StickyNote, Settings as SettingsIcon } from "lucide-react";

import { AppShell, EmptyState } from "@/components/AppShell";
import { Btn, LinkBtn } from "@/components/Btn";
import { anyRandomPrompt } from "@/lib/prompts";
import {
  bookProgress,
  countWords,
  relativeTime,
  todayKey,
  useData,
  type Chapter,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Writer Idea Booster — Home" },
      {
        name: "description",
        content: "Your offline writing dashboard: recent books, writing stats and a daily idea booster.",
      },
      { property: "og:title", content: "Writer Idea Booster — Home" },
      {
        property: "og:description",
        content: "Your offline writing dashboard: recent books, writing stats and a daily idea booster.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const data = useData();
  const [prompt, setPrompt] = useState<{ category: string; text: string } | null>(null);

  useEffect(() => {
    setPrompt(anyRandomPrompt());
  }, []);

  const books = [...data.books].sort((a, b) => b.updatedAt - a.updatedAt);
  const recent = books.slice(0, 3);

  const lastChapter: Chapter | undefined = [...data.chapters].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const totalWords = data.chapters.reduce((s, c) => s + countWords(c.content), 0);
  const completedChapters = data.chapters.filter((c) => c.status === "Completed").length;
  const today = data.settings.log[todayKey()] ?? 0;
  const goal = data.settings.dailyGoal || 0;

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="book-title text-3xl leading-tight">Writer Idea Booster</h1>
        <p className="mt-1 text-sm text-muted-foreground">From a Spark of an Idea to a Book Plan.</p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3">
        {lastChapter ? (
          <LinkBtn
            to="/books/$bookId/write/$chapterId"
            params={{ bookId: lastChapter.bookId, chapterId: lastChapter.id }}
          >
            <PenLine className="size-4" /> Continue
          </LinkBtn>
        ) : (
          <LinkBtn to="/books/new" variant="primary">
            <PenLine className="size-4" /> Start writing
          </LinkBtn>
        )}
        <LinkBtn to="/books/new" variant="outline">
          <Plus className="size-4" /> New book
        </LinkBtn>
      </div>

      <section className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Books" value={data.books.length} />
          <Stat label="Words" value={totalWords.toLocaleString()} />
          <Stat label="Chapters done" value={`${completedChapters}/${data.chapters.length}`} />
        </div>
        {goal > 0 ? (
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Today's goal</span>
              <span>
                {today.toLocaleString()} / {goal.toLocaleString()} words
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, goal ? (today / goal) * 100 : 0)}%` }}
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="book-title text-lg">Recent books</h2>
          <Link to="/books" className="text-sm font-medium text-primary">
            See all
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="Your shelf is empty"
            body="Every book starts with one restless idea. Create your first book and give it a home."
            action={
              <LinkBtn to="/books/new">
                <Plus className="size-4" /> Create your first book
              </LinkBtn>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((book) => {
              const p = bookProgress(data, book.id);
              return (
                <Link
                  key={book.id}
                  to="/books/$bookId"
                  params={{ bookId: book.id }}
                  className="block rounded-2xl bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="book-title text-base">{book.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {book.genre || "No genre"} · {book.status}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{relativeTime(book.updatedAt)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {p.words.toLocaleString()}
                      {p.target ? ` / ${p.target.toLocaleString()}` : ""} words
                    </span>
                    <span>
                      {p.completed}/{p.chapters} chapters
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
      </section>

      <section className="mb-6 rounded-2xl border border-border bg-secondary p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
          <Sparkles className="size-4" /> Idea booster
        </div>
        <p className="book-title mt-2 text-lg leading-snug">{prompt?.text ?? "Loading a fresh prompt…"}</p>
        <div className="mt-3 flex items-center gap-2">
          <Btn variant="outline" onClick={() => setPrompt(anyRandomPrompt())} className="py-2">
            Another
          </Btn>
          <LinkBtn to="/ideas" variant="ghost" className="py-2">
            Open Ideas
          </LinkBtn>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <QuickLink to="/notes" icon={<StickyNote className="size-5" />} label="Notes" />
        <QuickLink to="/books" icon={<BookOpen className="size-5" />} label="Books" />
        <QuickLink to="/settings" icon={<SettingsIcon className="size-5" />} label="Backup" />
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="book-title text-xl">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-4 text-xs font-medium text-foreground shadow-sm"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </Link>
  );
}
