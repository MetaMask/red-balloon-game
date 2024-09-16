"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { RotateRightIcon } from "@/components/icons";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useBalloons } from "@/providers/Balloon";
import { LoadingButton } from "./ui/loading-button";
import toast from "react-hot-toast";

const AVATAR_BASE_URL = "https://api.dicebear.com/9.x/avataaars/svg";

const generateRandomSeed = () => Math.random().toString(36).substring(2, 15);

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Must contain at least 3 characters")
    .max(20, "Must not exceed 20 characters"),
  avatarUrl: z.string().url(),
});

export type SignUpFormProps = {
  redirect?: string;
};

export function SignUpForm({ redirect }: SignUpFormProps) {
  const { resetBalloons } = useBalloons();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { mutateAsync: createUser } = api.user.create.useMutation();
  const seed = useMemo(() => generateRandomSeed(), []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      avatarUrl: `${AVATAR_BASE_URL}?seed=${seed}`,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      await createUser(data);
      // reset balloons on localStorage
      resetBalloons();
      router.push(redirect ?? "/");
    } catch (error) {
      setIsPending(false);
      toast.error("Error creating account");
      console.log("Error creating account", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col justify-center gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>USERNAME</FormLabel>
                <FormControl>
                  <Input
                    data-1p-ignore
                    disabled={isPending}
                    className="border-background"
                    placeholder="EthereumMaxi"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AVATAR</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-1">
                    <Avatar className="ring-2 ring-white">
                      <AvatarImage src={field.value} alt="avatar" />
                      <AvatarFallback>EM</AvatarFallback>
                    </Avatar>
                    <Button
                      disabled={isPending}
                      type="button"
                      onClick={(ev) => {
                        ev.preventDefault();
                        field.onChange(
                          `${AVATAR_BASE_URL}?seed=${generateRandomSeed()}`,
                        );
                      }}
                    >
                      <RotateRightIcon className="mr-2" /> REFRESH
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton
          loading={isPending}
          type="submit"
          variant="secondary"
          size="lg"
          className="justify-self-end text-base font-bold"
        >
          Next
        </LoadingButton>
      </form>
    </Form>
  );
}
