import { SignUpForm } from "@/components/sign-up-form";

export const metadata = {
  title: "Criar conta",
};

type PageProps = {
  searchParams: Promise<{ email?: string; invite?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email, invite } = await searchParams;
  return <SignUpForm invitedEmail={email} hasInvite={Boolean(invite)} />;
}
