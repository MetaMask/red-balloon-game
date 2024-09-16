/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const MobileCheck = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const skipMobileCheck = Boolean(localStorage.getItem("skipMobileCheck"));

    if (!isMobile && !skipMobileCheck) {
      setIsOpen(true);
    }
  }, []);

  const handleContinue = () => {
    localStorage.setItem("skipMobileCheck", "true");
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Looks like you're not on a mobile device!
          </AlertDialogTitle>
          <AlertDialogDescription>
            Please use a mobile device to play this game as you'll need to scan
            the QR codes. In addition, the game state is kept in the browser's
            local storage, so please use the same browser throughout the game.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleContinue}>
            Continue anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
