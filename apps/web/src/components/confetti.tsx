"use client";

import ReactConfetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

export const Confetti = () => {
  const windowSize = useWindowSize();

  if (!windowSize) return null;

  return (
    <ReactConfetti width={window?.innerWidth} height={window?.innerHeight} />
  );
};
