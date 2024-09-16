import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;

  try {
    user = await api.user.profile();
  } catch (error) {
    console.log("No profile found.", error);
  }

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}
