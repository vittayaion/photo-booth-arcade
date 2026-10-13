"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { MascotState } from "../editor/types";
import manifest from "../../../public/assets/mascot/manifest.json";
export function Mascot({
  state = "idle",
  message,
  countdown,
  large = false,
}: {
  state?: MascotState;
  message?: string;
  countdown?: number;
  large?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const reduce = useReducedMotion();
  const animation = manifest.animations[state];
  useEffect(() => {
    setFrame(0);
    if (reduce || !animation.loop) return;
    const t = setInterval(
      () => setFrame((f) => (f + 1) % animation.frames.length),
      animation.frames[0].duration,
    );
    return () => clearInterval(t);
  }, [animation, reduce]);
  const index =
    state === "countdown" && countdown ? Math.max(0, 3 - countdown) : frame;
  return (
    <div
      className={`mascot-companion ${large ? "large" : ""}`}
      data-state={state}
    >
      <motion.div
        className="mascot-sprite"
        aria-label={`ปอมปอม ${state}`}
        animate={
          reduce
            ? {}
            : {
                y:
                  state === "happy" || state === "cheer"
                    ? [0, -7, 0]
                    : [0, -2, 0],
              }
        }
        transition={{ duration: 0.8, repeat: Infinity }}
        style={{
          backgroundImage: `url(${animation.src})`,
          backgroundPosition: `${-animation.frames[index].x}px ${-animation.frames[index].y}px`,
        }}
      />
      {message && (
        <div className="speech-bubble" role="status">
          {message}
          <span>ปอมปอม ♡</span>
        </div>
      )}
    </div>
  );
}
