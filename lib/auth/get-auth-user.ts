import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const getAuthUser = cache(async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  type UserMetadata = { full_name?: string } & Record<string, unknown>;
  const meta = user.user_metadata as UserMetadata;

  return {
    supabase,
    user,
    userProps: {
      name: meta.full_name ?? user.email ?? "User",
      email: user.email ?? "",
    },
  };
});
