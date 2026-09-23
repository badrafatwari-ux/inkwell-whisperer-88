import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, Check } from "lucide-react";

import {
  addWordsToday,
  bookChapters,
  countWords,
  updateChapter,
  useData,
} from "@/lib/store";

export const Route = createFileRoute("/books_/$bookId/write/$chapterId")({
  head: () => ({
    meta: [
      { title: "Write — Writer Idea Booster" },
      { name: "description", content: "A distraction-free chapter editor with autosave and live word count." },
      { property: "og:title", content: "Write — Writer Idea Booster" },
      { property: "og:description", content: "A distraction-free chapter editor with autosave and live word count." },
    ],
  }),
  component: WritePage,
});

function WritePage() {
  const { bookId, chapterId } = Route.useParams();
  const data = useData();
  const navigate = useNavigate();

  const chapters = useMemo(() => bookChapters(data, bookId), [data, bookId]);
  const index = chapters.findIndex((c) => c.id === chapterId);
  const chapter = chapters[index];
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : undefined;

  const [text, setText] = useState("");
  const [saved, setSaved] = useState(true);
  const lastWords = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load chapter content when switching chapters
  useEffect(() => {
    const c = chapters.find((x) => x.id === chapterId);
    setText(c?.content ?? "");
    lastWords.current = countWords(c?.content ?? "");
    setSaved(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  function save(value: string) {
    updateChapter(chapterId, { content: value });
    const words = countWords(value);
    if (words > lastWords.current) addWordsToday(words - lastWords.current);
    lastWords.current = words;
    setSaved(true);
  }

  function onChange(value: string) {
    setText(value);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(value), 700);
  }

  // flush pending save on unmount
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function go(id: string) {
    if (timer.current) clearTimeout(timer.current);
    save(text);
    navigate({ to: "/books/$bookId/write/$chapterId", params: { bookId, chapterId: id } });
  }

  if (!chapter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm text-muted-foreground">This chapter no longer exists.</p>
        <Link to="/books/$bookId/chapters" params={{ bookId }} className="text-sm font-semibold text-primary">
          Back to chapters
        </Link>
      </div>
    );
  }

  const words = countWords(text);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            to="/books/$bookId/chapters"
            params={{ bookId }}
            aria-label="Back to chapters"
            className="-ml-1 p-1 text-muted-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="book-title truncate text-base leading-tight">
              {chapter.number}. {chapter.title}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {words.toLocaleString()} words · {text.length.toLocaleString()} characters
              {chapter.targetWords ? ` · target ${chapter.targetWords.toLocaleString()}` : ""}
            </p>
          </div>
          <span
            className={`flex items-center gap-1 text-[11px] font-medium ${
              saved ? "text-muted-foreground" : "text-accent-foreground"
            }`}
          >
            {saved ? (
              <>
                <Check className="size-3.5" /> Saved
              </>
            ) : (
              "Saving…"
            )}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
        {chapter.summary ? (
          <p className="mb-3 rounded-xl bg-secondary px-3 py-2 text-xs text-secondary-foreground">
            {chapter.summary}
          </p>
        ) : null}
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing…"
          className="min-h-[60vh] w-full resize-none rounded-2xl bg-card p-5 font-serif text-[17px] leading-8 text-foreground outline-none placeholder:text-muted-foreground/60 shadow-sm"
        />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-4 py-3">
          <button
            disabled={!prev}
            onClick={() => prev && go(prev.id)}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Prev
          </button>
          <span className="text-xs text-muted-foreground">
            Chapter {index + 1} of {chapters.length}
          </span>
          <button
            disabled={!next}
            onClick={() => next && go(next.id)}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
      </nav>
    </div>
  );
}
