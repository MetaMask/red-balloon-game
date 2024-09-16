"use client";

import { redirect, usePathname, useSearchParams } from "next/navigation";

export function MaybeRedirect(props: {
  children: React.ReactNode;
  redirect: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construct query string from all search parameters
  const queryString = new URLSearchParams(searchParams).toString();

  // Combine pathname and queryString for the full redirect URL
  const fullPath = `${pathname}?${queryString}`;

  if (props.redirect) {
    // Use encodeURIComponent to ensure the fullPath is correctly encoded
    redirect(`/welcome?redirect=${encodeURIComponent(fullPath)}`);
  } else {
    return <>{props.children}</>;
  }
}
