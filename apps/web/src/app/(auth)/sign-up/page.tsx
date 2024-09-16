import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <main className="flex flex-1 flex-col p-6 text-foreground">
      <header className="flex flex-1 flex-col justify-center">
        <h1 className="pb-6 text-[4rem] font-bold leading-[94%] text-primary-foreground">
          Create a profile
        </h1>
        <h3 className="text-lg font-medium">
          When you share balloons with other players, your profile helps them
          know who you are.
        </h3>
      </header>
      <SignUpForm redirect={searchParams.redirect} />
    </main>
  );
}
