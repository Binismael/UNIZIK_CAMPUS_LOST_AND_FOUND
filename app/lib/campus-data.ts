import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuth } from "@/components/campus/session";
import { fallbackClaimQuestions } from "@/lib/campus";
import { supabase } from "@/lib/supabase";
import type { ClaimStatus, ItemRow, ItemStatus, ProfileRow } from "@/types/database";

export type Item = {
  id: string;
  title: string;
  category: string;
  colors: string[];
  brand: string;
  marks: string;
  summary: string;
  location: string;
  pin: { lat: number; lng: number } | null;
  status: ItemStatus;
  foundAt: string;
  photo: string | null;
  photoHidden: boolean;
  isMine: boolean;
};

export type Profile = {
  email: string;
  fullName: string;
  admissionNumber: string;
  faculty: string;
  department: string;
  level: string;
  residence: string;
  phone: string;
  profileComplete: boolean;
  matchAlerts: boolean;
  notifications: boolean;
};

type ItemLike = Pick<ItemRow, "id" | "title" | "category" | "colors" | "brand" | "marks" | "summary" | "location" | "status" | "found_at" | "photo_path" | "finder_id"> &
  Partial<Pick<ItemRow, "location_lat" | "location_lng">>;

const ITEM_COLUMNS =
  "id, title, category, colors, brand, marks, summary, location, location_lat, location_lng, status, found_at, photo_path, finder_id";

function friendlyError(err: { message?: string; code?: string } | null, fallback = "Something went wrong. Please try again.") {
  if (!err) return new Error(fallback);
  const msg = err.message ?? "";
  if (err.code === "23505" && msg.includes("admission_number")) return new Error("That admission number is already registered.");
  if (err.code === "23505" && msg.includes("claims_one_pending")) return new Error("You already have a pending claim on this item.");
  if (msg.includes("claims_proof_text_check")) return new Error("Give at least 20 characters of proof.");
  if (err.code === "42501" && msg.includes("row-level security")) return new Error("You can't do that on this item.");
  return new Error(msg || fallback);
}

// Photos are private: only the finder and an approved claimant may see them.
async function toItems(rows: ItemLike[], uid: string | undefined, approvedIds: ReadonlySet<string> = new Set()): Promise<Item[]> {
  const canSee = (r: ItemLike) => r.finder_id === uid || approvedIds.has(r.id);
  const paths = [...new Set(rows.filter(canSee).map((r) => r.photo_path).filter((p): p is string => Boolean(p)))];
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from("item-photos").createSignedUrls(paths, 60 * 60);
    for (const entry of data ?? []) if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl);
  }
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    colors: r.colors ?? [],
    brand: r.brand,
    marks: r.marks,
    summary: r.summary,
    location: r.location,
    pin: r.location_lat != null && r.location_lng != null ? { lat: r.location_lat, lng: r.location_lng } : null,
    status: r.status,
    foundAt: r.found_at,
    photo: r.photo_path && canSee(r) ? urls.get(r.photo_path) ?? null : null,
    photoHidden: Boolean(r.photo_path) && !canSee(r),
    isMine: r.finder_id === uid,
  }));
}

function toProfile(p: ProfileRow): Profile {
  const prefs = (p.notification_preferences ?? {}) as { match_alerts?: boolean; notifications?: boolean };
  return {
    email: p.email,
    fullName: p.full_name,
    admissionNumber: p.admission_number ?? "",
    faculty: p.faculty,
    department: p.department,
    level: p.level,
    residence: p.residence,
    phone: p.phone,
    profileComplete: p.profile_complete,
    matchAlerts: prefs.match_alerts ?? true,
    notifications: prefs.notifications ?? true,
  };
}

function useUid() {
  const { user } = useAuth();
  return user?.id;
}

// Profile ---------------------------------------------------------------------
export function useMyProfile() {
  const { user } = useAuth();
  const uid = user?.id;
  return useQuery({
    queryKey: ["profile", uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const [profileRes, newClaimsRes, pendingRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid!).maybeSingle(),
        supabase
          .from("claims")
          .select("id, items!inner(finder_id)", { count: "exact", head: true })
          .eq("items.finder_id", uid!)
          .eq("status", "pending"),
        supabase.from("claims").select("id", { count: "exact", head: true }).eq("claimant_id", uid!).eq("status", "pending"),
      ]);
      if (profileRes.error) throw friendlyError(profileRes.error);
      return {
        email: user?.email ?? "",
        googleName: (user?.user_metadata?.full_name as string | undefined) ?? (user?.user_metadata?.name as string | undefined) ?? "",
        profile: profileRes.data ? toProfile(profileRes.data) : null,
        newClaims: newClaimsRes.count ?? 0,
        pendingClaims: pendingRes.count ?? 0,
      };
    },
  });
}

export type CampusDetails = {
  fullName: string;
  admissionNumber: string;
  faculty: string;
  department: string;
  level: string;
  residence: string;
  phone: string;
};

export function useSaveProfile() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: CampusDetails) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: v.fullName.trim(),
          admission_number: v.admissionNumber.trim(),
          faculty: v.faculty,
          department: v.department,
          level: v.level,
          residence: v.residence,
          phone: v.phone,
          profile_complete: true,
        })
        .eq("id", uid!);
      if (error) throw friendlyError(error);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useUpdatePreferences() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: { matchAlerts: boolean; notifications: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: { match_alerts: prefs.matchAlerts, notifications: prefs.notifications } })
        .eq("id", uid!);
      if (error) throw friendlyError(error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// Items -----------------------------------------------------------------------
export function useRecentItems(category: string, limit: number) {
  const uid = useUid();
  return useQuery({
    queryKey: ["items", "recent", category, limit, uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      let q = supabase.from("items").select(ITEM_COLUMNS).eq("status", "found").order("found_at", { ascending: false }).limit(limit);
      if (category !== "All") q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw friendlyError(error);
      return toItems(data, uid);
    },
  });
}

export type SearchResult = Item & { match: "best" | "possible" };

export function useSearch(query: string) {
  const uid = useUid();
  return useQuery({
    queryKey: ["items", "search", query, uid],
    enabled: Boolean(uid) && query.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<{
        criteria: { category: string; colors: string[]; brand: string; marks: string; location: string };
        usedAi: boolean;
        results: (ItemLike & { match: "best" | "possible" })[];
      }>("search-items", { body: { query } });
      if (error || !data) throw new Error("Search failed. Try again in a moment.");
      const items = await toItems(data.results, uid);
      const results: SearchResult[] = items.map((it, i) => ({ ...it, match: data.results[i]?.match ?? "possible" }));
      return { criteria: data.criteria, usedAi: data.usedAi, results };
    },
  });
}

export function useItem(id: string) {
  const uid = useUid();
  return useQuery({
    queryKey: ["items", "detail", id, uid],
    enabled: Boolean(uid && id),
    queryFn: async () => {
      const [itemRes, claimRes] = await Promise.all([
        supabase.from("items").select(ITEM_COLUMNS).eq("id", id).maybeSingle(),
        supabase
          .from("claims")
          .select("id, status")
          .eq("item_id", id)
          .eq("claimant_id", uid!)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (itemRes.error) throw friendlyError(itemRes.error);
      if (!itemRes.data) return null;
      const myClaim = claimRes.data as { id: string; status: ClaimStatus } | null;
      const [item] = await toItems([itemRes.data], uid, new Set(myClaim?.status === "approved" ? [id] : []));
      return { item: item!, myClaim };
    },
  });
}

export type TagResult = {
  tags: { title: string; category: string; colors: string[]; brand: string; marks: string; summary: string } | null;
  reason: "not-configured" | "failed" | null;
};

export function useTagItem() {
  return useMutation({
    mutationFn: async (image: string) => {
      const { data, error } = await supabase.functions.invoke<TagResult>("tag-item", { body: { image } });
      if (error || !data) return { tags: null, reason: "failed" } as TagResult;
      return data;
    },
  });
}

function dataUrlToBlob(dataUrl: string) {
  const [head, b64] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(head ?? "")?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(b64 ?? ""), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

export function useCreateItem() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      category: string;
      colors: string[];
      brand: string;
      marks: string;
      summary: string;
      location: string;
      pin: { lat: number; lng: number } | null;
      photo: string | null;
    }) => {
      let photoPath: string | null = null;
      if (input.photo) {
        const blob = dataUrlToBlob(input.photo);
        if (blob.size > 5 * 1024 * 1024) throw new Error("That photo is over 5 MB. Try a smaller one.");
        photoPath = `${uid}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage.from("item-photos").upload(photoPath, blob, { contentType: blob.type });
        if (error) throw new Error(`Photo upload failed: ${error.message}`);
      }
      const { error } = await supabase.from("items").insert({
        finder_id: uid!,
        title: input.title,
        category: input.category,
        colors: input.colors,
        brand: input.brand,
        marks: input.marks,
        summary: input.summary,
        location: input.location,
        location_lat: input.pin?.lat ?? null,
        location_lng: input.pin?.lng ?? null,
        photo_path: photoPath,
      });
      if (error) throw friendlyError(error);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useReportItem() {
  const uid = useUid();
  return useMutation({
    mutationFn: async ({ itemId, reason }: { itemId: string; reason: string }) => {
      const { error } = await supabase.from("reports").insert({ item_id: itemId, reporter_id: uid!, reason: reason.trim() });
      if (error) throw friendlyError(error);
    },
  });
}

// Claims ----------------------------------------------------------------------
export function useClaimQuestions(itemId: string, category: string, enabled: boolean) {
  const uid = useUid();
  return useQuery({
    queryKey: ["claim-questions", itemId, uid],
    enabled: Boolean(uid && itemId) && enabled,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const fallback = { questions: fallbackClaimQuestions(category), usedAi: false };
      const timeout = new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 7000));
      const res = await Promise.race([
        supabase.functions.invoke<{ questions: string[] | null }>("claim-questions", { body: { itemId } }),
        timeout,
      ]).catch(() => null);
      const questions = res?.data?.questions;
      return questions?.length === 3 ? { questions, usedAi: true } : fallback;
    },
  });
}

export function useCreateClaim() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, proofText }: { itemId: string; proofText: string }) => {
      const { error } = await supabase.from("claims").insert({ item_id: itemId, claimant_id: uid!, proof_text: proofText });
      if (error) throw friendlyError(error);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useMyClaims() {
  const uid = useUid();
  return useQuery({
    queryKey: ["claims", "mine", uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claims")
        .select(`id, status, created_at, item:items!inner(${ITEM_COLUMNS})`)
        .eq("claimant_id", uid!)
        .order("created_at", { ascending: false });
      if (error) throw friendlyError(error);
      const rows = data.map((c) => c.item as ItemLike);
      const approved = new Set(data.filter((c) => c.status === "approved").map((c) => (c.item as ItemLike).id));
      const items = await toItems(rows, uid, approved);
      return data.map((c, i) => ({ id: c.id, status: c.status, item: items[i]! }));
    },
  });
}

export function useMyPosts() {
  const uid = useUid();
  return useQuery({
    queryKey: ["items", "mine", uid],
    enabled: Boolean(uid),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select(`${ITEM_COLUMNS}, claims(id, status, created_at)`)
        .eq("finder_id", uid!)
        .order("found_at", { ascending: false });
      if (error) throw friendlyError(error);
      const items = await toItems(data, uid);
      return items.map((item, i) => {
        const claims = [...(data[i]?.claims ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
        const pending = claims.filter((c) => c.status === "pending");
        return {
          ...item,
          pendingCount: pending.length,
          firstPendingClaimId: pending[0]?.id ?? null,
          approvedClaimId: claims.find((c) => c.status === "approved")?.id ?? null,
        };
      });
    },
  });
}

export function usePost(itemId: string) {
  const uid = useUid();
  return useQuery({
    queryKey: ["items", "post", itemId, uid],
    enabled: Boolean(uid && itemId),
    queryFn: async () => {
      const [itemRes, claimsRes] = await Promise.all([
        supabase.from("items").select(ITEM_COLUMNS).eq("id", itemId).maybeSingle(),
        supabase.rpc("get_item_claims", { p_item_id: itemId }),
      ]);
      if (itemRes.error) throw friendlyError(itemRes.error);
      if (claimsRes.error) throw friendlyError(claimsRes.error);
      if (!itemRes.data) return null;
      const [item] = await toItems([itemRes.data], uid);
      return {
        item: item!,
        claims: (claimsRes.data ?? []).map((c) => ({
          id: c.id,
          status: c.status,
          proofText: c.proof_text,
          createdAt: c.created_at,
          claimant: { fullName: c.claimant_name || "A student", department: c.claimant_department, level: c.claimant_level },
        })),
      };
    },
  });
}

export function useDecideClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ claimId, decision }: { claimId: string; decision: "approve" | "reject" }) => {
      const { error } =
        decision === "approve"
          ? await supabase.rpc("approve_claim", { p_claim_id: claimId })
          : await supabase.rpc("reject_claim", { p_claim_id: claimId });
      if (error) throw friendlyError(error);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useMarkReturned() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.rpc("mark_returned", { p_item_id: itemId });
      if (error) throw friendlyError(error);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useHandoverContact(claimId: string) {
  const uid = useUid();
  return useQuery({
    queryKey: ["claims", "handover", claimId, uid],
    enabled: Boolean(uid && claimId),
    queryFn: async () => {
      const { data: claim, error } = await supabase
        .from("claims")
        .select(`id, status, item:items!inner(${ITEM_COLUMNS})`)
        .eq("id", claimId)
        .eq("claimant_id", uid!)
        .maybeSingle();
      if (error) throw friendlyError(error);
      if (!claim) return null;
      const claimItem = claim.item as ItemLike;
      const [item] = await toItems([claimItem], uid, new Set(claim.status === "approved" ? [claimItem.id] : []));
      let contact: { fullName: string; phone: string; residence: string } | null = null;
      if (claim.status === "approved") {
        const { data } = await supabase.rpc("get_handover_contact", { p_claim_id: claimId });
        const row = data?.[0];
        if (row) contact = { fullName: row.full_name, phone: row.phone, residence: row.residence };
      }
      return { status: claim.status, item: item!, contact };
    },
  });
}

// Realtime: refresh lists when claims or items change for this user.
export function useRealtimeRefresh() {
  const uid = useUid();
  const qc = useQueryClient();
  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`campus-${uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "claims" }, () => qc.invalidateQueries())
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => qc.invalidateQueries({ queryKey: ["items"] }))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, qc]);
}
