"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface TextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  staggerChildren?: number;
  once?: boolean;
}

export function TextReveal({
  children,
  className = "",
  as: Tag = "h1",
  delay = 0,
  staggerChildren = 0.03,
  once = true,
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10%" });

  const words = children.split(" ");

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
              delay: delay + i * staggerChildren,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

interface CharRevealProps {
  children: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function CharReveal({
  children,
  className = "",
  delay = 0,
  once = true,
}: CharRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10%" });

  return (
    <span ref={ref} className={className}>
      {children.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1],
            delay: delay + i * 0.02,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}