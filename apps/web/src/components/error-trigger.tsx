"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export const ErrorTrigger = () => {
  const initialized = useRef(false);
  const params = useSearchParams();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const error = params.get("error");
      if (error) {
        toast(error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
