"use client";

import { EmptyCard } from "@/components/empty-card";

export default function BalloonPageError() {
  return (
    <main className="flex flex-1 flex-col items-center gap-4 px-6 pb-16 pt-20">
      <EmptyCard>
        <div className="text-xl font-semibold">Balloon not found</div>
        <div className="text-sm text-muted-foreground">
          This balloon does not exist.
        </div>
      </EmptyCard>
    </main>
  );
}
