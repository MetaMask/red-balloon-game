import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { WalletAddressDrawerContent } from "./wallet-address";

type WalletAddressProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onSuccess?: () => void;
};

export const WalletAddressDrawer = ({
  open,
  onOpenChange,
  onClose,
  onSuccess,
}: WalletAddressProps) => {
  return (
    <Drawer onClose={onClose} onOpenChange={onOpenChange} open={open}>
      <DrawerContent className="min-h-auto max-h-[92%]">
        <WalletAddressDrawerContent onSuccess={onSuccess} />
      </DrawerContent>
    </Drawer>
  );
};
