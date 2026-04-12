import { createClient } from "@/lib/supabase/client";

export interface MarketplaceListing {
  id: string;
  project_id: string | null;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  listing_type: "project" | "service";
  contact_email: string | null;
  published_at: string;
  is_active: boolean;
}

export interface ListingWithOwner extends MarketplaceListing {
  owner_name: string | null;
  project_score: number | null;
}

export async function getListings(): Promise<ListingWithOwner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*, profiles:owner_id(username), projects:project_id(score)")
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return ((data ?? []) as unknown[]).map((row: unknown) => {
    const r = row as Record<string, unknown>;
    const profiles = r.profiles as { username?: string } | null;
    const projects = r.projects as { score?: number } | null;
    return {
      ...(r as unknown as MarketplaceListing),
      owner_name: profiles?.username ?? null,
      project_score: projects?.score ?? null,
    };
  });
}

export async function getListingById(id: string): Promise<ListingWithOwner | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*, profiles:owner_id(username), projects:project_id(score)")
    .eq("id", id)
    .single();

  if (error) return null;

  const r = data as Record<string, unknown>;
  const profiles = r.profiles as { username?: string } | null;
  const projects = r.projects as { score?: number } | null;
  return {
    ...(r as unknown as MarketplaceListing),
    owner_name: profiles?.username ?? null,
    project_score: projects?.score ?? null,
  };
}

export async function createListing(
  listing: Omit<MarketplaceListing, "id" | "published_at" | "is_active">
): Promise<MarketplaceListing> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marketplace_listings")
    .insert({ ...listing, is_active: true })
    .select()
    .single();

  if (error) throw error;
  return data as MarketplaceListing;
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("marketplace_listings")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function expressInterest(
  listingId: string,
  message: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("marketplace_interests")
    .upsert(
      { listing_id: listingId, from_user_id: user.id, message },
      { onConflict: "listing_id,from_user_id" }
    );
  if (error) throw error;
}
