import Link from "next/link";
import { ArrowLeft } from "./icons";

export type HeaderProps = {
  title: string;
  description?: string;
  backPath?: string;
};

export function Header({ title, description, backPath }: HeaderProps) {
  return (
    <header className="grid w-full gap-2 bg-primary px-6 py-4">
      <div className="flex flex-col gap-4">
        {backPath && (
          <Link href={backPath}>
            <ArrowLeft />
          </Link>
        )}
        <div className="flex items-center justify-between">
          <h1 className="text-[1.75rem] font-bold leading-[1.75rem]">
            {title}
          </h1>
        </div>
      </div>

      {description && (
        <p className="text-sm font-medium leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
