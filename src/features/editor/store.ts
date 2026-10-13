"use client";
import { create } from "zustand";
import type { Layout } from "../frames/catalog";
import type { BoothDocument, EditorItem, Photo } from "./types";
interface BoothStore {
  document: BoothDocument | null;
  selected: string | null;
  past: EditorItem[][];
  future: EditorItem[][];
  output: string | null;
  outputBlob: Blob | null;
  start: (frameId: string, layout: Layout) => void;
  setPhoto: (index: number, photo: Photo | null) => void;
  commit: (items: EditorItem[]) => void;
  select: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setOutput: (blob: Blob) => void;
  reset: () => void;
}
const revoke = (url: string | null | undefined) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};
export const useBooth = create<BoothStore>((set, get) => ({
  document: null,
  selected: null,
  past: [],
  future: [],
  output: null,
  outputBlob: null,
  start: (frameId, layout) => {
    get().reset();
    set({
      document: {
        frameId,
        layout,
        photos: Array(layout).fill(null),
        items: [],
      },
    });
  },
  setPhoto: (index, photo) => {
    const d = get().document;
    if (!d) return;
    revoke(d.photos[index]?.url);
    revoke(get().output);
    set({
      document: {
        ...d,
        photos: d.photos.map((p, i) => (i === index ? photo : p)),
      },
      output: null,
      outputBlob: null,
    });
  },
  commit: (items) => {
    const s = get();
    if (!s.document) return;
    revoke(s.output);
    set({
      document: { ...s.document, items },
      past: [...s.past, s.document.items].slice(-100),
      future: [],
      output: null,
      outputBlob: null,
    });
  },
  select: (selected) => set({ selected }),
  undo: () => {
    const s = get();
    if (!s.document || !s.past.length) return;
    revoke(s.output);
    set({
      document: { ...s.document, items: s.past.at(-1)! },
      past: s.past.slice(0, -1),
      future: [s.document.items, ...s.future],
      selected: null,
      output: null,
      outputBlob: null,
    });
  },
  redo: () => {
    const s = get();
    if (!s.document || !s.future.length) return;
    revoke(s.output);
    set({
      document: { ...s.document, items: s.future[0] },
      past: [...s.past, s.document.items],
      future: s.future.slice(1),
      selected: null,
      output: null,
      outputBlob: null,
    });
  },
  setOutput: (blob) => {
    revoke(get().output);
    set({ output: URL.createObjectURL(blob), outputBlob: blob });
  },
  reset: () => {
    const s = get();
    s.document?.photos.forEach((p) => revoke(p?.url));
    revoke(s.output);
    set({
      document: null,
      selected: null,
      past: [],
      future: [],
      output: null,
      outputBlob: null,
    });
  },
}));
