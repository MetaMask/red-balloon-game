"use client";

import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CopyToClipboard } from "@/components/copy-to-clipboard";
import { QRCodeIcon } from "@/components/icons";
import { buildInviteLink } from "@/lib/utils";
import { useState } from "react";

export function InviteActions() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="flex justify-center gap-4">
      <Button
        variant="action"
        size="smpill"
        onClick={() => {
          setShowQR(true);
        }}
      >
        <QRCodeIcon /> QR CODE
      </Button>
      <CopyToClipboard value={buildInviteLink()} />
      <InviteQRCode open={showQR} onChange={setShowQR} />
    </div>
  );
}

const InviteQRCode = ({
  open,
  onChange,
}: {
  open: boolean;
  onChange: (open: boolean) => void;
}) => (
  <Drawer open={open} onOpenChange={onChange}>
    <DrawerContent className="max-h-[75vh]">
      <DrawerHeader className="text-left">
        <DrawerTitle>Invite link</DrawerTitle>
      </DrawerHeader>
      <div className="flex justify-center p-4 pb-8">
        <QRCode value={buildInviteLink()} size={256} />
      </div>
    </DrawerContent>
  </Drawer>
);
