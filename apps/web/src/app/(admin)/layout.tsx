import { DashboardAuthDialog } from "@/components/dashboard/auth";
import { api } from "@/trpc/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await api.admin.authenticated();
  } catch (error) {
    return <DashboardAuthDialog />;
  }

  return <>{children}</>;
}
