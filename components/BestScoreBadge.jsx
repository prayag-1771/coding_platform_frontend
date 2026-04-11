"use client";

import { useEffect, useState } from "react";
import { getBestScore } from "./bestScore";

export default function BestScoreBadge({ questionId }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!questionId) return;
    const s = getBestScore(questionId);
    setScore(s);
  }, [questionId]);

  if (!score) return null;

  return (
    <div className="mt-1 inline-flex items-center gap-2
                    px-3 py-1 rounded-full
                    bg-emerald-400/10
                    text-emerald-300
                    text-xs font-semibold">
      Best: {score.passed} / {score.total}
    </div>
  );
}
