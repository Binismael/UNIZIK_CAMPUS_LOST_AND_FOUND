import { useActionQuery } from "@agent-native/core/client/hooks";

import { AppPage } from "@/components/campus/shell";
import { BtnLink, CardSkeleton, EmptyState, ItemCard } from "@/components/campus/ui";

export function meta() {
  return [{ title: "My claims · CampusLost&Found" }];
}

export default function MyClaims() {
  const { data, isLoading, isError } = useActionQuery("list-my-claims", {});
  return (
    <AppPage title="My claims" brandHeader>
      <h1 className="mb-5 text-[28px] font-bold text-ink lg:text-[26px]">My claims</h1>
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">{[0, 1].map((i) => <CardSkeleton key={i} />)}</div>
      ) : isError ? (
        <EmptyState title="Couldn't load your claims" body="Check your connection and try again." />
      ) : !data?.length ? (
        <EmptyState
          title="No claims yet"
          body="Lost something? Search for it, then prove it's yours to claim it."
          action={<BtnLink to="/">Search found items</BtnLink>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((c) => (
            <ItemCard
              key={c.id}
              item={c.item}
              pill={c.status === "approved" ? "approved" : c.status === "rejected" ? "rejected" : "pending"}
              to={c.status === "approved" ? `/claims/${c.id}` : `/items/${c.item.id}`}
              footer={c.status === "approved" ? "Contact shared. Arrange the handover." : undefined}
            />
          ))}
        </div>
      )}
    </AppPage>
  );
}
