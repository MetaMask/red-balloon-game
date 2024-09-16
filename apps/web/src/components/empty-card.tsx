import { type ReactNode } from "react";

export const EmptyCard = ({ children }: { children: ReactNode }) => (
  <main className="mb-14 flex flex-1 items-center justify-center px-14 pb-4 pt-4 text-center">
    <div className="grid gap-4">{children}</div>
  </main>
);
