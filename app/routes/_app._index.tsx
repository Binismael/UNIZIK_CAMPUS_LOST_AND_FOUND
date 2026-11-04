import { useState } from "react";

import { SearchBox } from "@/components/campus/search-box";
import { AppPage } from "@/components/campus/shell";
import { CardSkeleton, EmptyState, ItemCard, BtnLink } from "@/components/campus/ui";
import { CATEGORY_CHIPS } from "@/lib/campus";
import { cn } from "@/lib/utils";
import { useRecentItems } from "@/lib/campus-data";

export function meta() {
  return [{ title: "Home · CampusLost&Found" }];
}

export default function Home() {
  const [category, setCategory] = useState<string>("All");
  const { data, isLoading, isError } = useRecentItems(category, 4);

  return (
    <AppPage title="Home" brandHeader>
      <h1 className="text-[34px] font-bold leading-tight text-ink lg:text-[30px]">
        Lost something?
        <br className="lg:hidden" /> Search for it.
      </h1>
      <div className="mt-6">
        <SearchBox />
      </div>
      <div className="-mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0" role="group" aria-label="Filter by category">
        {CATEGORY_CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "h-11 shrink-0 rounded-full px-5 text-[17px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40 lg:px-4 lg:text-[15px]",
              category === c ? "bg-brand text-white" : "bg-surface text-brand hover:bg-divider",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <h2 className="mb-4 mt-6 text-xl font-bold text-ink lg:text-lg">Found recently</h2>
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load items" body="Check your connection and try again." />
      ) : !data?.length ? (
        <EmptyState
          title={category === "All" ? "Nothing posted yet" : `No ${category.toLowerCase()} found recently`}
          body="When someone finds an item on campus it will show up here."
          action={<BtnLink to="/report">Report found item</BtnLink>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((item, i) => (
            <ItemCard key={item.id} item={item} pill="found" to={`/items/${item.id}`} className={i === 3 ? "max-lg:hidden" : undefined} />
          ))}
        </div>
      )}
    </AppPage>
  );
}
