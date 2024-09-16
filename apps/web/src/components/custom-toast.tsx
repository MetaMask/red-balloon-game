"use client";

import { SquareExclamationIcon } from "./icons";
import toast, { Toaster, ToastBar } from "react-hot-toast";

export const CustomToast = () => {
  return (
    <Toaster
      toastOptions={{
        className:
          "rounded-lg !bg-accent text-sm font-medium leading-[18px] text-accent-foreground",
        duration: 10000,
        position: "top-center",
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ message }) => (
            <div
              className="flex items-center gap-1"
              onClick={() => toast.dismiss(t.id)}
            >
              <SquareExclamationIcon className="shrink-0" />
              {message}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};
