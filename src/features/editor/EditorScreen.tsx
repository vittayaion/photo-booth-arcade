"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Copy,
  Heart,
  Redo2,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { ArcadeButton, BackLink, PageTitle, Stepper } from "@/components/ui";
import {
  STICKER_NAMES,
  TEXT_STICKERS,
  stickerSrc,
  textStickerSrc,
} from "../frames/catalog";
import { Mascot } from "../mascot/Mascot";
import { useBooth } from "./store";
import type { EditorItem } from "./types";
import type { CompositionHandle } from "./PhotoComposition";
const Composition = dynamic(
  () => import("./PhotoComposition").then((m) => m.PhotoComposition),
  {
    ssr: false,
    loading: () => <div className="canvas-loading">กำลังเตรียมโต๊ะตกแต่ง…</div>,
  },
);
export function EditorScreen() {
  const router = useRouter();
  const store = useBooth();
  const doc = store.document;
  const [tab, setTab] = useState<"stickers" | "words" | "text">("stickers");
  const [text, setText] = useState("วันดี ๆ ของเรา ♡");
  const [color, setColor] = useState("#FF78B2");
  const [fontSize, setFontSize] = useState(64);
  const [editing, setEditing] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const composition = useRef<CompositionHandle>(null);
  const textInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!doc) router.replace("/");
    else if (doc.photos.some((p) => !p)) router.replace("/camera");
  }, [doc, router]);
  const remove = useCallback(() => {
    const s = useBooth.getState();
    if (s.document && s.selected) {
      s.commit(s.document.items.filter((i) => i.id !== s.selected));
      s.select(null);
    }
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,[contenteditable]"))
        return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? useBooth.getState().redo() : useBooth.getState().undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        useBooth.getState().redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        remove();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [remove]);
  if (!doc) return <main className="loading-screen">กำลังเตรียมรูป…</main>;
  const selected = doc.items.find((i) => i.id === store.selected);
  const add = (src: string, word = false) => {
    const item: EditorItem = {
      id: crypto.randomUUID(),
      kind: "sticker",
      src,
      x: word ? 262 : 380,
      y: 770,
      width: word ? 500 : 260,
      height: word ? 176 : 260,
      rotation: 0,
      fontSize: 64,
      color: "#FF78B2",
    };
    store.commit([...doc.items, item]);
    store.select(item.id);
  };
  const update = (item: EditorItem) =>
    store.commit(doc.items.map((i) => (i.id === item.id ? item : i)));
  const duplicate = () => {
    if (!selected) return;
    const item = {
      ...selected,
      id: crypto.randomUUID(),
      x: selected.x + 35,
      y: selected.y + 35,
    };
    store.commit([...doc.items, item]);
    store.select(item.id);
  };
  const editText = (id: string) => {
    const item = doc.items.find((i) => i.id === id);
    if (item?.kind !== "text") return;
    setText(item.text ?? "");
    setColor(item.color);
    setFontSize(item.fontSize);
    setEditing(id);
    setTab("text");
    setTimeout(() => textInput.current?.focus(), 50);
  };
  const saveText = () => {
    if (!text.trim()) return;
    const item: EditorItem = {
      id: editing ?? crypto.randomUUID(),
      kind: "text",
      text: text.trim(),
      x: selected?.id === editing ? selected.x : 112,
      y: selected?.id === editing ? selected.y : 790,
      width: selected?.id === editing ? selected.width : 800,
      height: selected?.id === editing ? selected.height : 230,
      rotation: selected?.id === editing ? selected.rotation : 0,
      fontSize,
      color,
    };
    if (editing)
      store.commit(
        doc.items.map((i) =>
          i.id === editing ? { ...i, text: item.text, color, fontSize } : i,
        ),
      );
    else store.commit([...doc.items, item]);
    store.select(item.id);
    setEditing(null);
  };
  const preview = async () => {
    if (!composition.current) return;
    setBusy(true);
    setError("");
    try {
      const blob = await composition.current.exportPNG();
      store.setOutput(blob);
      router.push("/preview");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <main className="flow-main editor-main">
      <div className="flow-top">
        <BackLink href="/camera" />
        <Stepper />
      </div>
      <PageTitle
        eyebrow="LEVEL 03 · ADD A LITTLE YOU"
        title="เติมความคิวท์ให้เต็มเฟรม"
        description="แปะสติกเกอร์ ลาก หมุน ย่อขยาย แล้วเขียนความทรงจำของคุณ"
      />
      <div className="editor-layout">
        <aside className="panel sticker-palette">
          <div className="palette-tabs">
            <button
              className={tab === "stickers" ? "active" : ""}
              onClick={() => setTab("stickers")}
            >
              <Heart size={17} /> สติกเกอร์
            </button>
            <button
              className={tab === "words" ? "active" : ""}
              onClick={() => setTab("words")}
            >
              <Sparkles size={17} /> คำคิวท์
            </button>
            <button
              className={tab === "text" ? "active" : ""}
              onClick={() => {
                setTab("text");
                setEditing(null);
              }}
            >
              <Type size={17} /> ข้อความ
            </button>
          </div>
          {tab === "stickers" ? (
            <>
              <div className="palette-heading">
                <span>STICKER COLLECTION</span>
                <b>32</b>
              </div>
              <div className="sticker-grid">
                {STICKER_NAMES.map((name) => (
                  <button
                    key={name}
                    aria-label={`เพิ่มสติกเกอร์ ${name}`}
                    onClick={() => add(stickerSrc(name))}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/pom-sticker",
                        stickerSrc(name),
                      );
                    }}
                  >
                    <img src={stickerSrc(name)} alt={name} draggable={false} />
                  </button>
                ))}
              </div>
              <p className="hint">แตะเพื่อแปะ หรือลากลงบนรูปได้เลย</p>
            </>
          ) : tab === "words" ? (
            <div className="word-grid">
              {TEXT_STICKERS.map((word) => (
                <button
                  key={word}
                  aria-label={`เพิ่ม ${word}`}
                  onClick={() => add(textStickerSrc(word), true)}
                >
                  <img src={textStickerSrc(word)} alt={word} />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-form">
              <label htmlFor="sticker-text">
                {editing ? "แก้ไขข้อความของคุณ" : "เขียนอะไรน่ารัก ๆ"}
              </label>
              <textarea
                id="sticker-text"
                ref={textInput}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={150}
                rows={4}
              />
              <label htmlFor="text-size">
                ขนาดตัวอักษร <span>{Math.round(fontSize)}</span>
              </label>
              <input
                id="text-size"
                type="range"
                min={24}
                max={150}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
              <label>สีข้อความ</label>
              <div className="color-swatches">
                {[
                  "#FF78B2",
                  "#B9A5FF",
                  "#409dd5",
                  "#252044",
                  "#ffffff",
                  "#f3ac35",
                ].map((c) => (
                  <button
                    key={c}
                    className={c === color ? "active" : ""}
                    aria-label={`สี ${c}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  >
                    {c === color && <Check size={14} />}
                  </button>
                ))}
              </div>
              <ArcadeButton
                tone="purple"
                onClick={saveText}
                disabled={!text.trim()}
              >
                <Type size={17} />
                {editing ? "บันทึกข้อความ" : "เพิ่มข้อความ"}
              </ArcadeButton>
            </div>
          )}
        </aside>
        <section className="editor-workspace">
          <div className="editor-toolbar">
            <span>
              <span className="status-dot" /> YOUR MASTERPIECE
            </span>
            <div>
              <button
                aria-label="Undo"
                title="Undo (⌘Z)"
                disabled={!store.past.length}
                onClick={store.undo}
              >
                <Undo2 size={19} />
              </button>
              <button
                aria-label="Redo"
                title="Redo (⌘⇧Z)"
                disabled={!store.future.length}
                onClick={store.redo}
              >
                <Redo2 size={19} />
              </button>
            </div>
          </div>
          <div
            className="editor-canvas-wrap"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const src = e.dataTransfer.getData("application/pom-sticker");
              if (!STICKER_NAMES.some((n) => stickerSrc(n) === src)) return;
              const rect = e.currentTarget
                .querySelector("canvas")
                ?.getBoundingClientRect();
              if (!rect) return;
              const item: EditorItem = {
                id: crypto.randomUUID(),
                kind: "sticker",
                src,
                x: ((e.clientX - rect.left) / rect.width) * 1024 - 130,
                y: ((e.clientY - rect.top) / rect.height) * 1820 - 130,
                width: 260,
                height: 260,
                rotation: 0,
                fontSize: 64,
                color,
              };
              store.commit([...doc.items, item]);
              store.select(item.id);
            }}
          >
            <Composition
              ref={composition}
              document={doc}
              selected={store.selected}
              interactive
              onSelect={store.select}
              onChange={update}
              onReady={setReady}
              onTextEdit={editText}
            />
          </div>
          <div className="selection-toolbar">
            <button
              disabled={!selected}
              onClick={duplicate}
              aria-label="Duplicate"
            >
              <Copy size={17} />
              <span>ทำซ้ำ</span>
            </button>
            <button
              disabled={!selected}
              onClick={() => selected && update({ ...selected, rotation: 0 })}
              aria-label="Reset rotation"
            >
              <RotateCcw size={17} />
              <span>ตั้งตรง</span>
            </button>
            <button
              disabled={selected?.kind !== "text"}
              onClick={() => selected && editText(selected.id)}
              aria-label="Edit text"
            >
              <Type size={17} />
              <span>แก้ข้อความ</span>
            </button>
            <button disabled={!selected} onClick={remove} aria-label="Delete">
              <Trash2 size={17} />
              <span>ลบ</span>
            </button>
          </div>
        </section>
        <aside className="editor-side">
          <div className="editor-tip">
            <span className="eyebrow">POM POM'S TIPS</span>
            <h3>
              น้อยก็น่ารัก
              <br />
              เยอะก็ยิ่งคิวท์ ♡
            </h3>
            <p>
              แตะสติกเกอร์เพื่อเลือก
              <br />
              ลากมุมเพื่อย่อ–ขยาย
              <br />
              ลากจุดด้านบนเพื่อหมุน
            </p>
            <img src="/assets/stickers/pom-love.png" alt="" />
          </div>
          <Mascot state="editing" message="เพิ่มสติกเกอร์อีกหน่อยไหม?" />
          <ArcadeButton
            tone="purple"
            disabled={!ready || busy}
            onClick={() => void preview()}
          >
            {busy ? "กำลังเตรียมรูป…" : "PREVIEW"}
            <ChevronRight size={18} />
          </ArcadeButton>
          <p className="hint">ทุกอย่างจะอยู่ในรูปตามที่เห็นเลย</p>
          {error && (
            <p className="inline-notice" role="alert">
              {error}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
