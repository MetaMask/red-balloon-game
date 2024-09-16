"use client";

import { BalloonIcon, CircleInfoIcon, HandshakeIcon } from "@/components/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  {
    name: "Balloons",
    href: "/balloons",
    icon: <BalloonIcon />,
  },
  {
    name: "Share",
    href: "/share",

    icon: <HandshakeIcon />,
  },
  {
    name: "Info",
    href: "/info",

    icon: <CircleInfoIcon />,
  },
];
export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 h-14 w-full bg-primary text-primary-foreground">
      <ul className="flex h-full w-full flex-row items-center">
        {tabs.map((tab) => (
          <li key={tab.name} className="h-full flex-1">
            <Link
              href={tab.href}
              className={cn(
                "flex h-full w-full items-center justify-center",
                pathname.startsWith(tab.href) && "bg-[#ffffff]/10",
              )}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                {tab.icon}
                <span className="text-[0.525rem] font-bold">{tab.name}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
