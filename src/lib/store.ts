import { useSyncExternalStore } from "react";

export type BookStatus = "Idea" | "Planning" | "Drafting" | "Completed";
export const BOOK_STATUSES: BookStatus[] = ["Idea", "Planning", "Drafting", "Completed"];

export type ChapterStatus = "Idea" | "Planned" | "Drafting" | "Completed";
export const CHAPTER_STATUSES: ChapterStatus[] = ["Idea", "Planned", "Drafting", "Completed"];

export const WORLD_CATEGORIES = [
  "History",
  "Culture",
  "Rules",
  "Geography",
  "Technology",
  "Important Events",
  "Other",
] as const;
export type WorldCategory = (typeof WORLD_CATEGORIES)[number];

export interface Book {
  id: string;
  title: string;
  genre: string;
  description: string;
  theme: string;
  tone: string;
  targetWords: number;
  status: BookStatus;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  summary: string;
  goal: string;
  conflict: string;
  characters: string;
  location: string;
  notes: string;
  targetWords: number;
  status: ChapterStatus;
  content: string;
  updatedAt: number;
}

export interface Character {
  id: string;
  bookId: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  goal: string;
  motivation: string;
  fear: string;
  strengths: string;
  weaknesses: string;
  background: string;
  arc: string;
  notes: string;
}

export interface LocationEntry {
  id: string;
  bookId: string;
  name: string;
  description: string;
  atmosphere: string;
  details: string;
  notes: string;
}

export interface WorldNote {
  id: string;
  bookId: string;
  category: WorldCategory;
  title: string;
  content: string;
}

export interface OutlineItem {
  id: string;
  bookId: string;
  title: string;
  summary: string;
  notes: string;
}

export interface SavedIdea {
  id: string;
  category: string;
  text: string;
  savedAt: number;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  bookId: string | null;
  updatedAt: number;
}

export interface Settings {
  dailyGoal: number;
  log: Record<string, number>;
}

export interface AppData {
  books: Book[];
  chapters: Chapter[];
  characters: Character[];
  locations: LocationEntry[];
  world: WorldNote[];
  outline: OutlineItem[];
  ideas: SavedIdea[];
  notes: QuickNote[];
  settings: Settings;
}

export const emptyData: AppData = {
  books: [],
  chapters: [],
  characters: [],
  locations: [],
  world: [],
  outline: [],
  ideas: [],
  notes: [],
  settings: { dailyGoal: 500, log: {} },
};

const KEY = "writer-idea-booster-v1";

let data: AppData = emptyData;
let loaded = false;
const listeners = new Set<() => void>();

function parse(raw: string): AppData {
  try {
    const parsed = JSON.parse(raw);
    return {
      ...emptyData,
      ...parsed,
      settings: { ...emptyData.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return emptyData;
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const raw = window.localStorage.getItem(KEY);
  if (raw) data = parse(raw);
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function getData(): AppData {
  ensureLoaded();
  return data;
}

export function update(fn: (d: AppData) => AppData) {
  ensureLoaded();
  data = fn(data);
  persist();
  emit();
}

export function replaceAll(next: AppData) {
  loaded = true;
  data = { ...emptyData, ...next, settings: { ...emptyData.settings, ...(next.settings ?? {}) } };
  persist();
  emit();
}

function subscribe(listener: () => void) {
  ensureLoaded();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useData(): AppData {
  return useSyncExternalStore(
    subscribe,
    () => getData(),
    () => emptyData,
  );
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function countWords(text: string) {
  const t = (text ?? "").trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function addWordsToday(delta: number) {
  if (!delta || delta <= 0) return;
  update((d) => {
    const k = todayKey();
    return { ...d, settings: { ...d.settings, log: { ...d.settings.log, [k]: (d.settings.log[k] ?? 0) + delta } } };
  });
}

/* ---------- derived helpers ---------- */

export function bookChapters(d: AppData, bookId: string) {
  return d.chapters.filter((c) => c.bookId === bookId).sort((a, b) => a.number - b.number);
}

export function bookWordCount(d: AppData, bookId: string) {
  return bookChapters(d, bookId).reduce((sum, c) => sum + countWords(c.content), 0);
}

export function bookProgress(d: AppData, bookId: string) {
  const chapters = bookChapters(d, bookId);
  const words = bookWordCount(d, bookId);
  const book = d.books.find((b) => b.id === bookId);
  const target = book?.targetWords || 0;
  return {
    words,
    target,
    percent: target > 0 ? Math.min(100, Math.round((words / target) * 100)) : 0,
    chapters: chapters.length,
    completed: chapters.filter((c) => c.status === "Completed").length,
  };
}

export function relativeTime(ts: number) {
  if (!ts) return "never";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

/* ---------- mutations ---------- */

export function createBook(partial: Partial<Book>): Book {
  const now = Date.now();
  const book: Book = {
    id: uid(),
    title: partial.title?.trim() || "Untitled Book",
    genre: partial.genre ?? "",
    description: partial.description ?? "",
    theme: partial.theme ?? "",
    tone: partial.tone ?? "",
    targetWords: partial.targetWords ?? 50000,
    status: partial.status ?? "Idea",
    notes: partial.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
  update((d) => ({ ...d, books: [book, ...d.books] }));
  return book;
}

export function updateBook(id: string, patch: Partial<Book>) {
  update((d) => ({
    ...d,
    books: d.books.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b)),
  }));
}

export function deleteBook(id: string) {
  update((d) => ({
    ...d,
    books: d.books.filter((b) => b.id !== id),
    chapters: d.chapters.filter((c) => c.bookId !== id),
    characters: d.characters.filter((c) => c.bookId !== id),
    locations: d.locations.filter((c) => c.bookId !== id),
    world: d.world.filter((c) => c.bookId !== id),
    outline: d.outline.filter((c) => c.bookId !== id),
    notes: d.notes.map((n) => (n.bookId === id ? { ...n, bookId: null } : n)),
  }));
}

export function touchBook(id: string) {
  update((d) => ({
    ...d,
    books: d.books.map((b) => (b.id === id ? { ...b, updatedAt: Date.now() } : b)),
  }));
}

/* ---------- chapters ---------- */

export function createChapter(bookId: string, partial: Partial<Chapter> = {}): Chapter {
  const existing = getData().chapters.filter((c) => c.bookId === bookId);
  const chapter: Chapter = {
    id: uid(),
    bookId,
    number: partial.number ?? existing.length + 1,
    title: partial.title?.trim() || `Chapter ${existing.length + 1}`,
    summary: partial.summary ?? "",
    goal: partial.goal ?? "",
    conflict: partial.conflict ?? "",
    characters: partial.characters ?? "",
    location: partial.location ?? "",
    notes: partial.notes ?? "",
    targetWords: partial.targetWords ?? 1500,
    status: partial.status ?? "Idea",
    content: partial.content ?? "",
    updatedAt: Date.now(),
  };
  update((d) => ({ ...d, chapters: [...d.chapters, chapter] }));
  touchBook(bookId);
  return chapter;
}

export function updateChapter(id: string, patch: Partial<Chapter>) {
  update((d) => ({
    ...d,
    chapters: d.chapters.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
    books: d.books.map((b) =>
      b.id === d.chapters.find((c) => c.id === id)?.bookId ? { ...b, updatedAt: Date.now() } : b,
    ),
  }));
}

export function deleteChapter(id: string) {
  update((d) => ({ ...d, chapters: d.chapters.filter((c) => c.id !== id) }));
}

export function moveChapter(bookId: string, id: string, dir: -1 | 1) {
  update((d) => {
    const list = d.chapters.filter((c) => c.bookId === bookId).sort((a, b) => a.number - b.number);
    const i = list.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return d;
    [list[i], list[j]] = [list[j], list[i]];
    const renumbered = new Map(list.map((c, idx) => [c.id, idx + 1]));
    return {
      ...d,
      chapters: d.chapters.map((c) => (renumbered.has(c.id) ? { ...c, number: renumbered.get(c.id)! } : c)),
    };
  });
}

/* ---------- generic collections ---------- */

type CollectionKey = "characters" | "locations" | "world" | "outline" | "notes";

export function addItem<K extends CollectionKey>(key: K, item: AppData[K][number]) {
  update((d) => ({ ...d, [key]: [...(d[key] as unknown[]), item] }) as AppData);
}

export function patchItem<K extends CollectionKey>(key: K, id: string, patch: Record<string, unknown>) {
  update(
    (d) =>
      ({
        ...d,
        [key]: (d[key] as Array<{ id: string }>).map((it) => (it.id === id ? { ...it, ...patch } : it)),
      }) as AppData,
  );
}

export function removeItem<K extends CollectionKey>(key: K, id: string) {
  update(
    (d) => ({ ...d, [key]: (d[key] as Array<{ id: string }>).filter((it) => it.id !== id) }) as AppData,
  );
}

export function newCharacter(bookId: string): Character {
  return {
    id: uid(),
    bookId,
    name: "",
    role: "",
    description: "",
    personality: "",
    goal: "",
    motivation: "",
    fear: "",
    strengths: "",
    weaknesses: "",
    background: "",
    arc: "",
    notes: "",
  };
}

export function newLocation(bookId: string): LocationEntry {
  return { id: uid(), bookId, name: "", description: "", atmosphere: "", details: "", notes: "" };
}

export function newWorldNote(bookId: string): WorldNote {
  return { id: uid(), bookId, category: "History", title: "", content: "" };
}

export function newOutlineItem(bookId: string): OutlineItem {
  return { id: uid(), bookId, title: "", summary: "", notes: "" };
}
