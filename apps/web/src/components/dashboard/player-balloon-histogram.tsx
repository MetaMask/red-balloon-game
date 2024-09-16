"use client";

import type { RouterOutputs } from "@/trpc/react";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { createRef, useEffect } from "react";

export function PlayerBalloonHistogram({
  userBalloons,
}: {
  userBalloons: RouterOutputs["admin"]["getUserBalloons"];
}) {
  const countBalloonsPerUser = d3.rollup(
    userBalloons,
    (D) => D.length,
    (b) => b.userId,
  );

  const containerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (userBalloons === undefined) return;

    const plot = Plot.plot({
      x: { label: "Total balloons collected", interval: 1 },
      y: {
        grid: true,
        interval: 1,
        tickFormat: d3.format(",.0f"), // Only integer ticks
        label: "Number of players",
      },
      color: { legend: true },
      marks: [
        Plot.rectY(
          countBalloonsPerUser,
          Plot.groupX(
            { y: "count" },
            {
              x: (b: Array<string | number>) => b[1],
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
        Player Balloon Histogram
      </h1>
      <div ref={containerRef} />
    </>
  );
}
