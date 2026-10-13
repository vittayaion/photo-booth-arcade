"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  ChevronRight,
  Heart,
  ImagePlus,
  LockKeyhole,
  Play,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ArcadeButton, Sparkle } from "@/components/ui";
import { Mascot } from "../mascot/Mascot";
import { useBooth } from "../editor/store";
import { BACKGROUNDS, FRAMES, type Layout } from "./catalog";
import { StripPreview } from "./StripPreview";
export function Home() {
  const [frameId, setFrame] = useState("pomeranian");
  const [layout, setLayout] = useState<Layout>(4);
  const [bg, setBg] = useState(0);
  const [collection, setCollection] = useState<"all" | "original" | "anime">(
    "all",
  );
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();
  const start = useBooth((s) => s.start);
  const reduce = useReducedMotion();
  const begin = () => {
    setLeaving(true);
    start(frameId, layout);
    setTimeout(() => router.push("/camera"), reduce ? 0 : 350);
  };
  return (
    <main className="home-main">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow hero-badge">
            <span className="status-dot" /> YOUR HAPPY LITTLE PHOTO BOOTH
          </div>
          <h1>
            SAY CHEESE,
            <br />
            <span>HOOMAN!</span>
            <Sparkle className="title-sparkle" />
          </h1>
          <p className="hero-thai">เก็บโมเมนต์น่ารัก… กับเพื่อนขนฟูของคุณ</p>
          <p className="hero-description">
            เลือกกรอบที่ใช่ โพสท่าที่ชอบ แล้วเติมความคิวท์
            <br className="desktop-break" />
            ให้ทุกความทรงจำด้วยสติกเกอร์พิกเซล ✨
          </p>
          <div className="hero-benefits">
            <span>
              <Camera size={15} /> ถ่ายได้เลย
            </span>
            <span>
              <Heart size={15} /> แต่งได้ตามใจ
            </span>
            <span>
              <LockKeyhole size={14} /> เป็นส่วนตัว 100%
            </span>
          </div>
        </div>
        <div
          className={`hero-art scene-${bg}`}
          style={{
            backgroundImage: `linear-gradient(0deg,rgba(249,230,255,.35),rgba(255,245,232,.05)),url(/assets/backgrounds/${BACKGROUNDS[bg]}.webp)`,
          }}
        >
          <span className="art-label">
            <span className="status-dot" /> POM POM STUDIO
          </span>
          <div className="hero-photo">
            <StripPreview frameId={frameId} layout={layout} sample />
          </div>
          <motion.img
            className="hero-pom"
            src="/assets/mascot/hero.png"
            alt="ปอมปอม หมาปอมขาวส้มถือกล้อง"
            animate={reduce ? {} : { y: [0, -8, 0], rotate: [-2, 1, -2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <span className="hero-bubble">พร้อมยิ้มกันหรือยัง? ♡</span>
          <Sparkle className="art-sparkle one" />
          <Sparkle className="art-sparkle two" />
          <span className="floating-heart">♥</span>
          <span className="art-stamp">
            100%
            <br />
            GOOD VIBES
          </span>
          <div className="scene-picker" aria-label="เลือกฉากหลัง">
            {BACKGROUNDS.map((b, i) => (
              <button
                key={b}
                onClick={() => setBg(i)}
                className={bg === i ? "active" : ""}
                aria-label={`ฉาก ${b}`}
                aria-pressed={bg === i}
                style={{
                  background: ["#e7c3ff", "#4d417a", "#ffaecb", "#9ed9fa"][i],
                }}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="frame-section" aria-labelledby="frame-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LEVEL 01 · MAKE IT YOURS</span>
            <h2 id="frame-heading">
              เลือกกรอบที่เป็นคุณ <span>♡</span>
            </h2>
          </div>
          <div className="layout-selector" aria-label="จำนวนช่องภาพ">
            {([1, 4, 6] as const).map((n) => (
              <button
                key={n}
                className={layout === n ? "active" : ""}
                onClick={() => setLayout(n)}
                aria-pressed={layout === n}
              >
                <span className={`layout-glyph glyph-${n}`}>
                  {Array.from({ length: n }, (_, i) => (
                    <i key={i} />
                  ))}
                </span>
                {n} ช่อง
              </button>
            ))}
          </div>
        </div>
        <div className="collection-picker" aria-label="คอลเลกชันกรอบ">
          {(
            [
              ["all", "ทั้งหมด", FRAMES.length],
              [
                "original",
                "Pom & Friends",
                FRAMES.filter((f) => f.tag !== "ANIME").length,
              ],
              [
                "anime",
                "Anime Collection",
                FRAMES.filter((f) => f.tag === "ANIME").length,
              ],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              aria-pressed={collection === id}
              onClick={() => setCollection(id)}
            >
              {id === "anime" && <Sparkles size={15} />} {label}{" "}
              <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="frame-grid">
          {FRAMES.filter(
            (f) =>
              collection === "all" ||
              (collection === "anime" ? f.tag === "ANIME" : f.tag !== "ANIME"),
          ).map((f) => (
            <button
              key={f.id}
              className={`frame-card ${frameId === f.id ? "selected" : ""}`}
              onClick={() => setFrame(f.id)}
              aria-pressed={frameId === f.id}
              aria-label={`เลือกกรอบ ${f.name}`}
            >
              <div className="frame-card-art" style={{ background: f.color }}>
                <span className="frame-number">
                  {String(FRAMES.indexOf(f) + 1).padStart(2, "0")}
                </span>
                {frameId === f.id && (
                  <span className="frame-check">
                    <Check size={14} />
                  </span>
                )}
                <StripPreview frameId={f.id} layout={layout} />
              </div>
              <strong>{f.name}</strong>
              <small>{f.thai}</small>
            </button>
          ))}
        </div>
        <div className="start-panel">
          <Mascot
            state={leaving ? "walk" : "idle"}
            message="เลือกกรอบได้เลย แล้วไปถ่ายรูปกัน!"
          />
          <div className="start-actions">
            <span>
              <Sparkles size={14} /> ฟรีทุกช็อต · ไม่ต้องสมัครสมาชิก
            </span>
            <ArcadeButton onClick={begin} disabled={leaving}>
              <Play size={21} fill="currentColor" /> START GAME{" "}
              <ChevronRight size={19} />
            </ArcadeButton>
          </div>
        </div>
      </section>
      <div className="home-how">
        <span>
          <b>01</b> เลือกกรอบ
        </span>
        <i>···</i>
        <span>
          <b>02</b> ยิ้มให้กล้อง
        </span>
        <i>···</i>
        <span>
          <b>03</b> เติมความคิวท์
        </span>
        <i>···</i>
        <span>
          <b>04</b> เก็บความทรงจำ <ImagePlus size={15} />
        </span>
      </div>
    </main>
  );
}
