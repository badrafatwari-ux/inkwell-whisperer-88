import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/AppShell";
import { Btn } from "@/components/Btn";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { Field, TextArea, TextInput } from "@/components/Field";
import { Modal } from "@/components/Modal";
import { NAME_LIST_KEYS, randomName } from "@/lib/names";
import { addItem, newLocation, patchItem, removeItem, useData, type LocationEntry } from "@/lib/store";

export const Route = createFileRoute("/books/$bookId/locations")({
  head: () => ({
    meta: [
      { title: "Locations — Writer Idea Booster" },
      { name: "description", content: "Describe the places in your book: atmosphere, details and notes." },
      { property: "og:title", content: "Locations — Writer Idea Booster" },
      { property: "og:description", content: "Describe the places in your book: atmosphere, details and notes." },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const { bookId } = Route.useParams();
  const data = useData();
  const list = data.locations.filter((l) => l.bookId === bookId);

  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState<LocationEntry>(() => newLocation(bookId));

  const set = (k: keyof LocationEntry, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    const payload = { ...form, name: form.name.trim() || "Unnamed place" };
    if (isNew) addItem("locations", payload);
    else patchItem("locations", payload.id, payload);
    setOpen(false);
  };

  return (
    <div>
      <Btn
        onClick={() => {
          setForm(newLocation(bookId));
          setIsNew(true);
          setOpen(true);
        }}
        className="mb-4 w-full"
      >
        <Plus className="size-4" /> Add location
      </Btn>

      {list.length === 0 ? (
        <EmptyState title="No locations yet" body="Where does this story happen? Give each place a mood of its own." />
      ) : (
        <div className="space-y-3">
          {list.map((l) => (
            <div key={l.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm">
              <button
                onClick={() => {
                  setForm(l);
                  setIsNew(false);
                  setOpen(true);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <h3 className="book-title text-base">{l.name}</h3>
                {l.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
                ) : null}
              </button>
              <ConfirmDelete
                title="Delete location?"
                description={`${l.name} will be removed from this book.`}
                onConfirm={() => removeItem("locations", l.id)}
                trigger={(openDialog) => (
                  <button aria-label="Delete" onClick={openDialog} className="p-1 text-muted-foreground">
                    <Trash2 className="size-4" />
                  </button>
                )}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={isNew ? "New location" : "Edit location"}
        onClose={() => setOpen(false)}
        footer={
          <Btn onClick={save} className="w-full">
            Save location
          </Btn>
        }
      >
        <div className="rounded-xl bg-secondary p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">Place name ideas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {randomName(NAME_LIST_KEYS.includes("Place names") ? "Place names" : NAME_LIST_KEYS[0], 4).map((n) => (
              <button
                key={n}
                onClick={() => set("name", n)}
                className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Field label="Name">
          <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Description">
          <TextArea value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Atmosphere">
          <TextArea value={form.atmosphere} onChange={(e) => set("atmosphere", e.target.value)} />
        </Field>
        <Field label="Important details">
          <TextArea value={form.details} onChange={(e) => set("details", e.target.value)} />
        </Field>
        <Field label="Notes">
          <TextArea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
