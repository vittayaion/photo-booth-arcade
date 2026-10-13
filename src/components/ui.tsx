"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, ChevronLeft, Heart, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
export function ArcadeButton({
  children,
  tone = "pink",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "pink" | "purple" | "blue" | "cream";
  children: ReactNode;
}) {
  return (
    <button {...props} className={`arcade-button ${tone} ${className}`}>
      {children}
    </button>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Pomeranian Photo Booth home">
        <span className="brand-icon">
          <Camera size={26} />
        </span>
        <span>
          <strong>
            POMERANIAN<span className="brand-paw"> ✿</span>
          </strong>
          <small>PHOTO BOOTH ARCADE</small>
        </span>
      </Link>
      <span className="header-note">
        <span className="status-dot" /> GOOD TIMES, LITTLE PAWS
      </span>
      <span className="header-heart">
        <Heart size={19} fill="currentColor" />
      </span>
    </header>
  );
}
export function Stepper() {
  const path = usePathname();
  const paths = ["/", "/camera", "/editor", "/preview", "/result"];
  const active = paths.indexOf(path);
  return (
    <nav className="stepper" aria-label="ขั้นตอนถ่ายรูป">
      {["เลือกกรอบ", "ถ่ายรูป", "ตกแต่ง", "ตรวจรูป", "ดาวน์โหลด"].map(
        (label, i) => (
          <span
            key={label}
            className={`step ${i === active ? "active" : ""} ${i < active ? "complete" : ""}`}
            aria-current={i === active ? "step" : undefined}
          >
            <b>{i < active ? "✓" : i + 1}</b>
            <span>{label}</span>
            {i < 4 && <i />}
          </span>
        ),
      )}
    </nav>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">
        <Sparkles size={14} />
        {eyebrow}
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function BackLink({ href = "/" }: { href?: string }) {
  return (
    <Link className="back-link" href={href}>
      <ChevronLeft size={16} /> BACK
    </Link>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <span>✦ A LITTLE JOY, ONE SNAP AT A TIME ✦</span>
      <p>
        ทำด้วยความรัก และอุ้งเท้าปอมปอม <Heart size={12} />
        <span>รูปของคุณอยู่บนอุปกรณ์ของคุณเท่านั้น</span>
      </p>
    </footer>
  );
}
export function Sparkle({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={`sparkle ${className}`}
      animate={reduce ? {} : { rotate: [0, 12, -8, 0], scale: [1, 1.15, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      ✦
    </motion.span>
  );
}
