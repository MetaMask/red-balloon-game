import Navbar from "@/components/navbar";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto bg-background">
        {children}
      </div>
      <Navbar />
    </>
  );
}
