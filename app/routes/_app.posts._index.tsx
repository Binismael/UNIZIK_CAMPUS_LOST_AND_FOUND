
import { AppPage } from "@/components/campus/shell";
import { BtnLink, CardSkeleton, EmptyState, ItemCard, type PillKind } from "@/components/campus/ui";
import { useMyPosts } from "@/lib/campus-data";

export function meta() {
  return [{ title: "My posts · CampusLost&Found" }];
}

export default function MyPosts() {
  const { data, isLoading, isError } = useMyPosts();
  return (
    <AppPage title="My posts" brandHeader>
      <h1 className="mb-5 text-[28px] font-bold text-ink lg:text-[26px]">My posts</h1>
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">{[0, 1].map((i) => <CardSkeleton key={i} />)}</div>
      ) : isError ? (
        <EmptyState title="Couldn't load your posts" body="Check your connection and try again." />
      ) : !data?.length ? (
        <EmptyState
          title="You haven't posted anything"
          body="Found something on campus? Snap a photo and Gemini will tag it for you."
          action={<BtnLink to="/report" variant="amber">Report found item</BtnLink>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((p) => {
            let pill: PillKind = "no-claims";
            let to: string | undefined = `/items/${p.id}`;
            let footer: string | undefined;
            if (p.status === "returned") {
              pill = "returned";
            } else if (p.status === "claimed") {
              pill = "approved";
              to = `/posts/${p.id}/handover`;
              footer = "Claim approved. Hand it over.";
            } else if (p.pendingCount > 0 && p.firstPendingClaimId) {
              pill = "new-claim";
              to = `/posts/${p.id}/claims/${p.firstPendingClaimId}`;
              footer = `${p.pendingCount} claim${p.pendingCount === 1 ? "" : "s"} waiting for your review`;
            }
            return <ItemCard key={p.id} item={p} pill={pill} to={to} footer={footer} />;
          })}
        </div>
      )}
    </AppPage>
  );
}
