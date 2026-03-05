"use client";

import { motion } from "framer-motion";
import { CirclePlus, Cross, HeartPulse, Pill, Plus } from "lucide-react";
import { PiHeartbeatBold } from "react-icons/pi";

type IconType = (props: { size?: number; className?: string }) => JSX.Element;

interface AnimatedMedicalBackgroundProps {
  density?: "normal" | "premium";
  accentColor?: string;
}

const shapes = [
  { icon: Plus, left: "6%", top: "12%", size: 18, delay: 0 },
  { icon: HeartPulse, left: "18%", top: "70%", size: 24, delay: 0.8 },
  { icon: CirclePlus, left: "74%", top: "18%", size: 22, delay: 1.4 },
  { icon: Pill, left: "82%", top: "64%", size: 20, delay: 2 },
  { icon: PiHeartbeatBold, left: "44%", top: "16%", size: 26, delay: 0.5 },
  { icon: Plus, left: "56%", top: "82%", size: 14, delay: 1.8 },
  { icon: Cross, left: "32%", top: "24%", size: 20, delay: 0.2 },
  { icon: Pill, left: "68%", top: "78%", size: 16, delay: 2.5 },
  { icon: CirclePlus, left: "88%", top: "34%", size: 16, delay: 1.1 },
  { icon: HeartPulse, left: "8%", top: "46%", size: 20, delay: 2.2 },
  { icon: Cross, left: "47%", top: "90%", size: 14, delay: 1.6 },
  { icon: Plus, left: "14%", top: "28%", size: 12, delay: 0.35 },
  { icon: CirclePlus, left: "26%", top: "56%", size: 15, delay: 1.05 },
  { icon: Pill, left: "38%", top: "72%", size: 13, delay: 1.75 },
  { icon: HeartPulse, left: "52%", top: "10%", size: 17, delay: 0.95 },
  { icon: Cross, left: "63%", top: "28%", size: 12, delay: 1.55 },
  { icon: Plus, left: "72%", top: "52%", size: 11, delay: 2.15 },
  { icon: CirclePlus, left: "84%", top: "72%", size: 14, delay: 2.45 },
  { icon: Pill, left: "92%", top: "14%", size: 12, delay: 0.6 },
  { icon: HeartPulse, left: "34%", top: "40%", size: 16, delay: 2.75 }
];

export default function AnimatedMedicalBackground({
  density = "normal",
  accentColor = "hsl(22 95% 52%)"
}: AnimatedMedicalBackgroundProps) {
  const densityCount = density === "premium" ? shapes.length : 6;
  const visibleShapes = shapes.slice(0, densityCount);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: accentColor, opacity: 0.2 }} />
      <div className="absolute -right-24 bottom-4 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: accentColor, opacity: 0.14 }} />
      {visibleShapes.map((shape, idx) => {
        const Icon = shape.icon as IconType;
        return (
          <motion.div
            key={idx}
            className="absolute rounded-full p-4 blur-[0.2px]"
            style={{
              left: shape.left,
              top: shape.top,
              backgroundColor: accentColor,
              color: accentColor,
              opacity: 0.32
            }}
            animate={{
              y: [0, -14, 0],
              x: [0, 8, 0],
              rotate: [0, 6, -6, 0]
            }}
            transition={{
              duration: 7 + idx * 0.75,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay
            }}
          >
            <Icon size={shape.size} />
          </motion.div>
        );
      })}
    </div>
  );
}
