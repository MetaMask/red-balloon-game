"use client";

import type { RouterOutputs } from "@/trpc/react";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { createRef, useEffect } from "react";

export function OffersHistogram({
  offersCount,
}: {
  offersCount: RouterOutputs["admin"]["getOffersCount"];
}) {
  const containerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (offersCount === undefined) return;

    const plot = Plot.plot({
      x: { label: "Number of balloons shared", interval: 1 },
      y: {
        grid: true,
        interval: 1,
        tickFormat: d3.format(",.0f"), // Only integer ticks
        label: "Number of players",
      },
      color: { legend: true },
      marks: [
        Plot.rectY(
          offersCount,
          Plot.groupX(
            { y: "count" },
            {
              x: (b: { count: number }) => b.count,
              fill: "lightgreen",
              tip: { fill: "darkblue" },
            },
          ),
        ),
        Plot.ruleY([0]),
      ],
    });

    containerRef.current?.append(plot);
    return () => plot.remove();
  });

  return (
    <>
      <h1 className="text-balance text-2xl font-bold text-secondary">
        Offers Histogram
      </h1>
      <div ref={containerRef} />
    </>
  );
}
