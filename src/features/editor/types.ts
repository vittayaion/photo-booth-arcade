import type { EffectId, Layout } from "../frames/catalog";
export interface Photo {
  id: string;
  url: string;
  effect: EffectId;
}
export interface EditorItem {
  id: string;
  kind: "sticker" | "text";
  src?: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize: number;
  color: string;
}
export interface BoothDocument {
  frameId: string;
  layout: Layout;
  photos: (Photo | null)[];
  items: EditorItem[];
}
export type MascotState =
  | "idle"
  | "walk"
  | "talk"
  | "happy"
  | "surprise"
  | "countdown"
  | "cheer"
  | "editing"
  | "success";
