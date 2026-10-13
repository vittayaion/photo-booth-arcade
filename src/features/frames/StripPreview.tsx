"use client";
import { Camera } from "lucide-react";
import { getFrame, HEIGHT, WIDTH, type Layout } from "./catalog";
import type { Photo } from "../editor/types";
export function StripPreview({
  frameId,
  layout,
  photos = [],
  sample = false,
  className = "",
}: {
  frameId: string;
  layout: Layout;
  photos?: (Photo | null)[];
  sample?: boolean;
  className?: string;
}) {
  const frame = getFrame(frameId);
  return (
    <div
      className={`strip-preview ${className}`}
      style={{ aspectRatio: `${WIDTH}/${HEIGHT}`, background: frame.color }}
    >
      {frame.variants[layout].slots.map((slot, i) => (
        <div
          className={`strip-slot slot-${i}`}
          key={i}
          style={{
            left: `${(slot.x / WIDTH) * 100}%`,
            top: `${(slot.y / HEIGHT) * 100}%`,
            width: `${(slot.width / WIDTH) * 100}%`,
            height: `${(slot.height / HEIGHT) * 100}%`,
          }}
        >
          {photos[i] ? (
            <img src={photos[i]!.url} alt={`ภาพ ${i + 1}`} />
          ) : sample ? (
            <img className="sample-pom" src="/assets/mascot/hero.png" alt="" />
          ) : (
            <Camera aria-hidden="true" />
          )}
        </div>
      ))}
      <img
        className="frame-overlay"
        src={frame.variants[layout].thumbnail}
        alt=""
        draggable={false}
      />
    </div>
  );
}
