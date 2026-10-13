"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  Check,
  ChevronRight,
  Download,
  Heart,
  Pencil,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import {
  ArcadeButton,
  BackLink,
  PageTitle,
  Sparkle,
  Stepper,
} from "@/components/ui";
import { useBooth } from "../editor/store";
import { Mascot } from "../mascot/Mascot";
export function FinishedScreen({ result = false }: { result?: boolean }) {
  const router = useRouter();
  const { document: doc, output, reset } = useBooth();
  const reduce = useReducedMotion();
  const [printed, setPrinted] = useState(!result || !!reduce);
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    if (!doc) router.replace("/");
    else if (!output) router.replace("/editor");
  }, [doc, output, router]);
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setPrinted(true), reduce ? 0 : 2300);
    return () => clearTimeout(t);
  }, [result, reduce]);
  if (!doc || !output)
    return <main className="loading-screen">กำลังเตรียมรูป…</main>;
  const download = () => {
    const a = window.document.createElement("a");
    a.href = output;
    a.download = `pompom-${doc.frameId}-${new Date().toISOString().slice(0, 10)}.png`;
    window.document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloaded(true);
  };
  return (
    <main className="flow-main finish-main">
      <div className="flow-top">
        <BackLink href={result ? "/preview" : "/editor"} />
        <Stepper />
      </div>
      <PageTitle
        eyebrow={
          result ? "LEVEL 05 · A MEMORY TO KEEP" : "LEVEL 04 · LOOKING PAW-FECT"
        }
        title={
          result ? "เย้! ความทรงจำพร้อมแล้ว" : "น่ารักขนาดนี้ เก็บไว้เลยไหม?"
        }
        description={
          result
            ? "ปอมปอมพิมพ์รูปให้แล้ว ดาวน์โหลดไปอวดความคิวท์กัน"
            : "ตรวจดูอีกนิด ก่อนส่งความทรงจำเข้าเครื่องพิมพ์"
        }
      />
      <div className="finish-layout">
        <section className={`finish-art ${result ? "printing" : ""}`}>
          <Sparkle className="finish-sparkle one" />
          <Sparkle className="finish-sparkle two" />
          {result && (
            <div className="printer">
              <div className="printer-header">
                <span>
                  <span className="status-dot" /> POM POM PRINT CLUB
                </span>
                <Heart size={18} fill="currentColor" />
              </div>
              <div className="printer-slot" />
              <span className="printer-light">
                {printed ? "READY!" : "PRINTING..."}
              </span>
            </div>
          )}
          <div className="print-window">
            <motion.img
              className="finished-photo"
              src={output}
              alt="ภาพสำเร็จของคุณ"
              initial={result && !reduce ? { y: "-95%", rotate: 0 } : false}
              animate={{ y: 0, rotate: result ? -3 : 0 }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
          </div>
          {!result && (
            <span className="preview-stamp">
              <Check size={14} /> READY FOR YOUR MEMORY BOX
            </span>
          )}
        </section>
        <section className="finish-info">
          <span className="eyebrow">MADE BY YOU, WITH A LITTLE MAGIC</span>
          <h2>
            {result ? (
              <>
                หนึ่งรูป
                <br />
                ความสุขเต็มเฟรม <span>♡</span>
              </>
            ) : (
              <>
                โมเมนต์ธรรมดา
                <br />
                ที่พิเศษกว่าเดิม <span>♡</span>
              </>
            )}
          </h2>
          <p>
            รูปของคุณ พร้อมกรอบและสติกเกอร์ที่เลือก
            <br />
            เก็บไว้เป็นความทรงจำดี ๆ ในทุกวัน
          </p>
          <div className="output-details">
            <span>
              <Check size={17} /> PNG คุณภาพสูง
            </span>
            <span>1024 × 1820 px</span>
            <span>
              <ShieldCheck size={17} /> รูปอยู่บนอุปกรณ์ของคุณ
            </span>
          </div>
          <Mascot
            state={result ? "success" : "happy"}
            message={
              result
                ? downloaded
                  ? "เก็บความทรงจำไว้แล้ว มาเล่นอีกนะ!"
                  : "เย้! รูปสวยมากเลย ♡"
                : "น่ารักที่สุด! พร้อมพิมพ์แล้วใช่ไหม?"
            }
          />
          {result ? (
            <>
              <ArcadeButton tone="blue" disabled={!printed} onClick={download}>
                <Download size={21} />
                {printed ? "DOWNLOAD PNG" : "กำลังพิมพ์รูป…"}
              </ArcadeButton>
              {downloaded && (
                <p className="download-notice" role="status">
                  ส่งรูปให้เบราว์เซอร์ดาวน์โหลดแล้ว ♡
                </p>
              )}
              <button
                className="text-button"
                onClick={() => {
                  reset();
                  router.push("/");
                }}
              >
                <RefreshCcw size={16} /> เริ่มเกมใหม่
              </button>
            </>
          ) : (
            <>
              <ArcadeButton onClick={() => router.push("/result")}>
                PRINT MY MEMORY <ChevronRight size={18} />
              </ArcadeButton>
              <button
                className="text-button"
                onClick={() => router.push("/editor")}
              >
                <Pencil size={16} /> กลับไปเติมความคิวท์
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
