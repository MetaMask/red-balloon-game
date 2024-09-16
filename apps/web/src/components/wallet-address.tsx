"use client";

import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, transformAddress, validateAddress } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoadingButton } from "./ui/loading-button";

const formSchema = z.object({
  address: z
    .string()
    .refine(validateAddress, { message: "Invalid wallet address / ENS name" }),
});

export type WalletAddressFormProps = {
  className?: string;
  onSuccess: (address: string) => void;
};

export function WalletAddressForm(props: WalletAddressFormProps) {
  const [isCheckingENS, setIsCheckingENS] = useState(false);
  const { mutateAsync: updateUser, isPending } = api.user.update.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    let walletAddress = null;
    try {
      setIsCheckingENS(true);
      walletAddress = (await transformAddress(data.address)) as `0x${string}`;
    } catch (error) {
      form.setError("address", {
        message: "Invalid wallet address / ENS name",
      });
    } finally {
      setIsCheckingENS(false);
    }

    if (!walletAddress) {
      form.setError("address", {
        message: "Invalid wallet address / ENS name",
      });
      return;
    }

    try {
      await updateUser({
        walletAddress,
      });
      props.onSuccess(walletAddress);
    } catch (error) {
      form.setError("address", {
        message: "Failed to update address. Please try again.",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", props.className)}
      >
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WALLET ADDRESS</FormLabel>
              <FormControl>
                <Input
                  data-1p-ignore
                  className="border-background"
                  placeholder="ENS / Address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex-1" />
        <LoadingButton
          loading={isPending || isCheckingENS}
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full text-base font-bold"
        >
          OK
        </LoadingButton>
      </form>
    </Form>
  );
}

export type WalletAddressDrawerContentProps = {
  onSuccess?: (address: string) => void;
};

export function WalletAddressDrawerContent({
  onSuccess,
}: WalletAddressDrawerContentProps) {
  const apiUtils = api.useUtils();

  return (
    <>
      <DrawerHeader className="text-left">
        <DrawerTitle>Wallet Address</DrawerTitle>
        <DrawerDescription>
          Enter an EVM wallet address for prize money and commissions.
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex flex-col overflow-y-scroll p-6 pt-0">
        <WalletAddressForm
          onSuccess={async (address) => {
            await apiUtils.user.profile.invalidate();
            onSuccess?.(address);
          }}
        />
      </div>
    </>
  );
}
