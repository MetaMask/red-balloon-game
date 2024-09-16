"use client";

import type { RouterOutputs } from "@/trpc/react";
import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import { createRef, useEffect } from "react";

const formatter = Intl.NumberFormat("en", { notation: "compact" });

export function CommissionDistribution({
  delegations,
  field,
  title,
}: {
  delegations: RouterOutputs["admin"]["getDelegations"];
  field: "commission" | "totalCommission";
  title: string;
}) {
  // console.log(delegations);

  // Rollup to count the number of delegations for each balloonIndex and commission
  const count = d3.rollup(
    delegations,
    (D) => D.length,
    (d) => d.balloonIndex + 1, // Convert from 0-indexed to 1-indexed
    (d) => d[field], // This is either d.commission or d.totalCommission
  );

  const countArrayForm = Array.from(count, ([balloonIndex, commissionMap]) =>
    Array.from(commissionMap, ([commission, count]) => ({
      balloonIndex,
      commission,
      count,
    })),
  );

  const countArrayFlatSorted = countArrayForm
    .flat()
    .sort(
      (a, b) => a.balloonIndex - b.balloonIndex || a.commission - b.commission,
    );

  type singleDelegationType = (typeof countArrayFlatSorted)[0];

  const containerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (delegations === undefined) return;

    const plot = Plot.plot({
      width: 1000,
      x: {
        label: "% commission",
      },
      y: {
        grid: true,
        label: "Balloon #",
      },
      color: {
        legend: "ramp",
        // @ts-expect-error: the compiler is wrong, `style` works
        style: "margin-left: 20px",
        label: "Frequency",
        scheme: "OrRd",
      },
      marks: [
        Plot.rect(countArrayFlatSorted, {
          x: "commission",
          y: "balloonIndex",
          fill: "count",
          inset: 0.5,
        }),
        Plot.text(countArrayFlatSorted, {
          x: "commission",
          y: "balloonIndex",
          text: (d: singleDelegationType) => formatter.format(d.count),
          fill: "darkblue",
          title: "title",
        }),
      ],
    });

    containerRef.current?.append(plot);
    return () => plot.remove();
  });

  return (
    <>
      <h1 className="text-balance text-2xl font-bold text-secondary">
        {title}
      </h1>
      <div ref={containerRef} />
    </>
  );
}
