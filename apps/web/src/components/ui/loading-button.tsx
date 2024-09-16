"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({ loading, ...props }: LoadingButtonProps) {
  if (loading) {
    return (
      <Button {...props} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }
  return <Button {...props} />;
}
