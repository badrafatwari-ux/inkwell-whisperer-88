import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Target, Type, Shuffle } from "lucide-react";

import { AppShell, PageTitle } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { Field, TextArea, TextInput } from "@/components/Field";
import { NAME_LIST_KEYS, randomName, type NameListKey } from "@/lib/names";
import { anyRandomPrompt } from "@/lib/prompts";
import { textStats } from "@/lib/text";
import { todayKey, update, useData } from "@/lib/store";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Writing Tools — Writer Idea Booster" },
      {
        name: "description",
        content: "Word counter, daily writing goal, random name generator and writing prompts — all offline.",
      },
      { property: "og:title", content: "Writing Tools — Writer Idea Booster" },
      {
        property: "og:description",
        content: "Word counter, daily writing goal, random name generator and writing prompts — all offline.",
      },
    ],
  }),
  component: ToolsPage,
});

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="book-title text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ToolsPage() {
  const data = useData();
  const [text, setText] = useState("");
  const stats = textStats(text);

  const [goalDraft, setGoalDraft] = useState<string | null>(null);
  const goal = data.settings.dailyGoal || 0;
  const today = data.settings.log[todayKey()] ?? 0;
  const remaining = Math.max(0, goal - today);

  const [nameKey, setNameKey] = useState<NameListKey>(NAME_LIST_KEYS[0]);
  const [names, setNames] = useState<string[]>(() => []);

  const [prompt, setPrompt] = useState<{ category: string; text: string } | null>(null);

  return (
    <AppShell>
      <PageTitle title="Tools" subtitle="Small helpers for the everyday writing session." />

      <Card icon={<Type className="size-5" />} title="Word counter">
        <TextArea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here…"
        />
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            ["Words", stats.words],
            ["Chars", stats.characters],
            ["Sentences", stats.sentences],
            ["Paras", stats.paragraphs],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl bg-muted py-2">
              <div className="book-title text-lg">{(value as number).toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card icon={<Target className="size-5" />} title="Writing goal">
        <Field label="Daily goal (words)">
          <TextInput
            type="number"
            inputMode="numeric"
            value={goalDraft ?? String(goal)}
            onChange={(e) => setGoalDraft(e.target.value)}
            onBlur={() => {
              const n = Math.max(0, Number(goalDraft ?? goal) || 0);
              update((d) => ({ ...d, settings: { ...d.settings, dailyGoal: n } }));
              setGoalDraft(null);
            }}
          />
        </Field>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Written today</span>
          <span className="font-semibold">{today.toLocaleString()} words</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Remaining</span>
          <span className="font-semibold">{remaining.toLocaleString()} words</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${goal ? Math.min(100, (today / goal) * 100) : 0}%` }}
          />
        </div>
      </Card>

      <Card icon={<Shuffle className="size-5" />} title="Name generator">
        <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {NAME_LIST_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => {
                setNameKey(k);
                setNames(randomName(k));
              }}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                k === nameKey ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        {names.length ? (
          <ul className="mb-3 grid grid-cols-2 gap-2">
            {names.map((n) => (
              <li key={n} className="rounded-xl bg-muted px-3 py-2 text-sm">
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">Tap generate for a fresh set of {nameKey.toLowerCase()}.</p>
        )}
        <Btn variant="outline" className="w-full" onClick={() => setNames(randomName(nameKey))}>
          Generate names
        </Btn>
      </Card>

      <Card icon={<Sparkles className="size-5" />} title="Random prompt">
        {prompt ? (
          <>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{prompt.category}</p>
            <p className="book-title mt-1 text-lg leading-snug">{prompt.text}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Need a spark? Pull a prompt from the built-in collection.</p>
        )}
        <Btn variant="outline" className="mt-3 w-full" onClick={() => setPrompt(anyRandomPrompt())}>
          New prompt
        </Btn>
      </Card>
    </AppShell>
  );
}
