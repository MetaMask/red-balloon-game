import QRCode from "react-qr-code";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { CopyToClipboard } from "./copy-to-clipboard";
import { type ReactNode } from "react";

type QRCodeDrawerProps = {
  url: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  message?: ReactNode;
};

export const QRCodeDrawer = ({
  url,
  open,
  title,
  message,
  onOpenChange,
  onClose,
}: QRCodeDrawerProps) => {
  return (
    <Drawer onClose={onClose} onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="min-h-auto max-h-[92%]">
        <DrawerHeader className="text-left">
          {title && <DrawerTitle>{title}</DrawerTitle>}
        </DrawerHeader>
        <div className="mb-8 flex flex-col items-center gap-6 overflow-y-scroll px-4">
          <QRCode value={url} className="size-3/4 rounded-md bg-white p-2" />
          <CopyToClipboard value={url} />
          {message}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
