import { Skeleton } from "@/components/ui/skeleton";

export default function TabsLoading() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <header className="bg-primary p-6">
        <Skeleton className="mb-6 h-6 w-2/3" />
        <Skeleton className="mb-2 h-3 w-full" />
        <Skeleton className="mb-2 h-3 w-full" />
      </header>
      <div className="grid grid-cols-2 gap-6 overflow-y-auto p-8">
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
      </div>
    </div>
  );
}
