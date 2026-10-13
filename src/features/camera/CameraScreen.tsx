"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CameraOff,
  Check,
  ChevronRight,
  FlipHorizontal2,
  ImagePlus,
  RefreshCcw,
  Upload,
  X,
} from "lucide-react";
import { ArcadeButton, BackLink, PageTitle, Stepper } from "@/components/ui";
import { useBooth } from "../editor/store";
import type { MascotState } from "../editor/types";
import { EFFECTS, getFrame, type EffectId } from "../frames/catalog";
import { StripPreview } from "../frames/StripPreview";
import { Mascot } from "../mascot/Mascot";
import { delay, loadImage, photograph } from "./photo";
export function CameraScreen() {
  const router = useRouter();
  const doc = useBooth((s) => s.document);
  const setPhoto = useBooth((s) => s.setPhoto);
  const video = useRef<HTMLVideoElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const sequence = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [retry, setRetry] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const [effect, setEffect] = useState<EffectId>("none");
  const [target, setTarget] = useState<number | null>(null);
  const [taking, setTaking] = useState<number | null>(null);
  const [mood, setMood] = useState<MascotState>("talk");
  useEffect(() => {
    if (!doc) router.replace("/");
  }, [doc, router]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      sequence.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    setReady(false);
    setError("");
    const open = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error("กรุณาเปิดผ่าน localhost หรือ HTTPS เพื่อใช้กล้อง");
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (video.current) {
          video.current.srcObject = stream;
          await video.current.play();
          if (!cancelled) setReady(video.current.videoWidth > 0);
        }
      } catch (e) {
        if (cancelled) return;
        const name = (e as Error).name;
        setError(
          name === "NotAllowedError"
            ? "ยังไม่ได้รับอนุญาตใช้กล้อง เปิดสิทธิ์กล้องในเบราว์เซอร์แล้วลองอีกครั้งได้เลย"
            : name === "NotFoundError"
              ? "ไม่พบกล้องบนอุปกรณ์นี้ เลือกอัปโหลดรูปแทนได้เลย"
              : name === "NotReadableError"
                ? "กล้องอาจถูกใช้งานอยู่ ปิดแอปอื่นแล้วลองอีกครั้ง"
                : (e as Error).message,
        );
        setMood("surprise");
      }
    };
    void open();
    return () => {
      cancelled = true;
      sequence.current?.abort();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, retry, !!doc]);
  if (!doc)
    return <main className="loading-screen">กำลังกลับไปหน้าเลือกกรอบ…</main>;
  const frame = getFrame(doc.frameId),
    slots = frame.variants[doc.layout].slots;
  const complete = doc.photos.every(Boolean);
  const activeIndex =
    taking ??
    target ??
    Math.max(
      0,
      doc.photos.findIndex((p) => !p),
    );
  const slot = slots[activeIndex];
  const cancel = () => {
    sequence.current?.abort();
    setCount(0);
    setBusy(false);
    setTaking(null);
    setMood("idle");
  };
  const capture = async () => {
    if (busy || !ready || !video.current) return;
    const controller = new AbortController();
    sequence.current = controller;
    setBusy(true);
    setNotice("");
    const indices =
      target !== null ? [target] : doc.photos.flatMap((p, i) => (p ? [] : [i]));
    try {
      for (const i of indices) {
        if (controller.signal.aborted) break;
        setTaking(i);
        setMood("countdown");
        for (let n = 3; n > 0; n--) {
          setCount(n);
          await delay(1000, controller.signal);
          if (controller.signal.aborted) break;
        }
        if (controller.signal.aborted) break;
        setCount(0);
        const blob = await photograph(
          video.current!,
          slots[i],
          effect,
          facing === "user",
        );
        if (controller.signal.aborted) break;
        setPhoto(i, {
          id: crypto.randomUUID(),
          url: URL.createObjectURL(blob),
          effect,
        });
        setMood("happy");
        await delay(650, controller.signal);
      }
      if (!controller.signal.aborted && mounted.current) {
        setMood("cheer");
        setTarget(null);
      }
    } catch (e) {
      if (mounted.current) {
        setNotice((e as Error).message);
        setMood("surprise");
      }
    } finally {
      if (mounted.current && sequence.current === controller) {
        setBusy(false);
        setCount(0);
        setTaking(null);
      }
    }
  };
  const upload = async (files: FileList | null) => {
    if (!files?.length || busy) return;
    setBusy(true);
    setNotice("");
    const indices =
      target !== null ? [target] : doc.photos.flatMap((p, i) => (p ? [] : [i]));
    if (!indices.length) {
      setNotice("เลือกช่องที่ต้องการเปลี่ยนรูปก่อนนะ");
      setBusy(false);
      return;
    }
    let filled = 0;
    let failures = 0;
    for (const file of Array.from(files)) {
      if (filled >= indices.length) break;
      let url = "";
      try {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
          throw new Error("รองรับ JPG, PNG และ WebP");
        url = URL.createObjectURL(file);
        const img = await loadImage(url);
        const i = indices[filled];
        const blob = await photograph(img, slots[i], effect);
        if (!mounted.current) break;
        setPhoto(i, {
          id: crypto.randomUUID(),
          url: URL.createObjectURL(blob),
          effect,
        });
        filled++;
      } catch {
        failures++;
      } finally {
        if (url) URL.revokeObjectURL(url);
      }
    }
    if (mounted.current) {
      setBusy(false);
      setTarget(null);
      setMood(failures ? "surprise" : "happy");
      setNotice(
        failures
          ? `อ่านไม่ได้ ${failures} ไฟล์ รองรับภาพ JPG, PNG และ WebP`
          : `เพิ่มรูปแล้ว ${filled} ภาพ`,
      );
    }
    if (input.current) input.current.value = "";
  };
  return (
    <main className="flow-main">
      <div className="flow-top">
        <BackLink />
        <Stepper />
      </div>
      <PageTitle
        eyebrow="LEVEL 02 · STRIKE A POSE"
        title="ยิ้มหน่อย… ปอมปอมรอถ่ายอยู่!"
        description="กดถ่าย แล้วเปลี่ยนท่าได้เลย เรานับ 3 วินาทีก่อนทุกช็อต"
      />
      <div className="camera-layout">
        <section className="panel camera-panel">
          <div className="panel-bar">
            <span>
              <span className={`status-dot ${ready ? "" : "offline"}`} />
              {ready ? "CAMERA IS READY" : "YOUR LITTLE STUDIO"}
            </span>
            <span>
              SHOT {Math.min(activeIndex + 1, doc.layout)} / {doc.layout}
            </span>
          </div>
          <div className="camera-viewport">
            <div
              className="live-crop"
              style={{
                aspectRatio: `${slot.width}/${slot.height}`,
                width: `min(100%, ${(100 * slot.width) / slot.height}cqh)`,
              }}
            >
              <video
                ref={video}
                muted
                playsInline
                autoPlay
                onLoadedData={() => setReady(true)}
                style={{
                  transform: facing === "user" ? "scaleX(-1)" : undefined,
                }}
              />
              {effect !== "none" && (
                <img
                  className="live-effect"
                  src={`/assets/effects/${effect}.png`}
                  alt=""
                />
              )}
              {count > 0 && (
                <div className="countdown" aria-live="assertive">
                  <b key={count}>{count}</b>
                  <span>ยิ้มหวาน ๆ เลย!</span>
                </div>
              )}
              <span className="viewfinder tl" />
              <span className="viewfinder tr" />
              <span className="viewfinder bl" />
              <span className="viewfinder br" />
            </div>
            {(!ready || error) && (
              <div className="camera-message">
                {error ? <CameraOff size={40} /> : <Camera size={40} />}
                <h3>{error ? "กล้องยังไม่พร้อม" : "กำลังเปิดกล้อง…"}</h3>
                <p>
                  {error ||
                    "อนุญาตใช้กล้องในเบราว์เซอร์ แล้วมาเก็บความทรงจำกัน"}
                </p>
                {error && (
                  <button
                    className="text-button"
                    onClick={() => setRetry((r) => r + 1)}
                  >
                    <RefreshCcw size={15} /> ลองอีกครั้ง
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="effect-picker">
            <span className="tiny-label">A LITTLE EXTRA MAGIC</span>
            <div>
              {EFFECTS.map((e) => (
                <button
                  key={e.id}
                  disabled={busy}
                  className={effect === e.id ? "active" : ""}
                  aria-pressed={effect === e.id}
                  onClick={() => setEffect(e.id)}
                >
                  <span>
                    {e.id === "none" ? (
                      <Camera size={20} />
                    ) : (
                      <img src={`/assets/effects/${e.id}.png`} alt="" />
                    )}
                  </span>
                  {e.name}
                </button>
              ))}
            </div>
          </div>
          <div className="camera-controls">
            <button
              className="icon-button"
              title="สลับกล้อง"
              aria-label="สลับกล้อง"
              disabled={busy}
              onClick={() =>
                setFacing((f) => (f === "user" ? "environment" : "user"))
              }
            >
              <FlipHorizontal2 />
            </button>
            {busy && count > 0 ? (
              <ArcadeButton tone="cream" onClick={cancel}>
                <X size={19} /> CANCEL
              </ArcadeButton>
            ) : (
              <ArcadeButton
                onClick={capture}
                disabled={!ready || busy || (complete && target === null)}
              >
                <Camera size={21} />
                {target !== null ? "RETAKE" : "CAPTURE"}
              </ArcadeButton>
            )}
            <button
              className="icon-button"
              title="อัปโหลดรูป"
              aria-label="อัปโหลดรูป"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              <Upload />
            </button>
          </div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => void upload(e.target.files)}
            data-testid="photo-upload"
          />
          <button
            className="upload-link"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <ImagePlus size={15} /> หรือเลือกรูปจากอุปกรณ์ของคุณ
          </button>
          {notice && (
            <p className="inline-notice" role="status">
              {notice}
            </p>
          )}
        </section>
        <aside className="camera-sidebar">
          <section className="panel shot-panel">
            <div className="section-mini-heading">
              <h2>ความทรงจำของคุณ</h2>
              <span>
                {doc.photos.filter(Boolean).length}/{doc.layout}
              </span>
            </div>
            <StripPreview
              frameId={doc.frameId}
              layout={doc.layout}
              photos={doc.photos}
            />
            <div className="shot-selectors">
              {doc.photos.map((p, i) => (
                <button
                  key={i}
                  className={target === i ? "selected" : ""}
                  aria-label={`เลือกถ่ายซ้ำช่อง ${i + 1}`}
                  onClick={() => {
                    setTarget(target === i ? null : i);
                    setNotice("");
                  }}
                  disabled={busy}
                >
                  {p ? <img src={p.url} alt="" /> : <Camera size={15} />}
                  <span>{i + 1}</span>
                  {p && <Check size={12} />}
                </button>
              ))}
            </div>
            <p className="hint">แตะหมายเลขเพื่อถ่ายซ้ำหรือเปลี่ยนรูป</p>
          </section>
          <Mascot
            state={count ? "countdown" : mood}
            countdown={count}
            message={
              count
                ? `${count}… ยิ้มหวาน ๆ เลย!`
                : complete
                  ? "ครบแล้ว! ไปเติมสติกเกอร์กันเถอะ ♡"
                  : "พร้อมแล้ว กด CAPTURE ได้เลย!"
            }
          />
          <ArcadeButton
            tone="purple"
            disabled={!complete || busy}
            onClick={() => router.push("/editor")}
          >
            ไปตกแต่งรูป <ChevronRight size={18} />
          </ArcadeButton>
        </aside>
      </div>
    </main>
  );
}
