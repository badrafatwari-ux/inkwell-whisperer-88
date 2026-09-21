import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, RefreshCw, Trash2 } from "lucide-react";

import { AppShell, PageTitle, EmptyState } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { PROMPT_CATEGORIES, randomPrompt, type PromptCategory } from "@/lib/prompts";
import { relativeTime, uid, update, useData } from "@/lib/store";

export const Route = createFileRoute("/ideas")({
  head: () => ({
    meta: [
      { title: "Idea Booster — Writer Idea Booster" },
      { name: "description", content: "Story, character, conflict, setting and plot-twist prompts, offline." },
      { property: "og:title", content: "Idea Booster — Writer Idea Booster" },
      {
        property: "og:description",
        content: "Story, character, conflict, setting and plot-twist prompts, offline.",
      },
    ],
  }),
  component: IdeasPage,
});

function IdeasPage() {
  const data = useData();
  const [category, setCategory] = useState<PromptCategory>("Story Ideas");
  const [prompt, setPrompt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrompt(randomPrompt(category));
    setSaved(false);
  }, [category]);

  const next = () => {
    setPrompt((p) => randomPrompt(category, p));
    setSaved(false);
  };

  const save = () => {
    if (!prompt) return;
    update((d) => ({
      ...d,
      ideas: [{ id: uid(), category, text: prompt, savedAt: Date.now() }, ...d.ideas],
    }));
    setSaved(true);
  };

  const remove = (id: string) => update((d) => ({ ...d, ideas: d.ideas.filter((i) => i.id !== id) }));

  return (
    <AppShell>
      <PageTitle title="Idea Booster" subtitle="Pick a category, then keep drawing sparks." />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {PROMPT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              c === category ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {c.replace(" Ideas", "").replace(" Writing Prompts", "")}
          </button>
        ))}
      </div>

      <section className="rounded-2xl bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
        <p className="book-title mt-3 text-xl leading-snug">{prompt}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Btn variant="outline" onClick={next}>
            <RefreshCw className="size-4" /> New prompt
          </Btn>
          <Btn onClick={save} disabled={saved}>
            <Bookmark className="size-4" /> {saved ? "Saved" : "Save idea"}
          </Btn>
        </div>
      </section>

      <h2 className="book-title mb-3 mt-8 text-lg">Saved ideas ({data.ideas.length})</h2>
      {data.ideas.length === 0 ? (
        <EmptyState title="Nothing saved yet" body="Tap Save idea whenever a prompt makes you want to write." />
      ) : (
        <div className="space-y-3">
          {data.ideas.map((idea) => (
            <div key={idea.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-relaxed text-foreground">{idea.text}</p>
                <button onClick={() => remove(idea.id)} className="shrink-0 p-1 text-muted-foreground">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {idea.category} · {relativeTime(idea.savedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
