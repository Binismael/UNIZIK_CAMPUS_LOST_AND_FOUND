import { useActionQuery } from "@agent-native/core/client/hooks";
import { IconSparkles } from "@tabler/icons-react";
import { useSearchParams } from "react-router";

import { SearchBox } from "@/components/campus/search-box";
import { AppPage } from "@/components/campus/shell";
import { BackHeader, CardSkeleton, EmptyState, ItemCard, Tag } from "@/components/campus/ui";

export function meta() {
  return [{ title: "Search results · CampusLost&Found" }];
}

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const { data, isLoading, isError } = useActionQuery("search-items", { query }, { enabled: query.length > 0 });

  const c = data?.criteria;
  const understood = c ? [c.category, ...c.colors, c.brand, c.marks, c.location].filter(Boolean) : [];
  const count = data?.results.length ?? 0;

  return (
    <AppPage title="Home">
      <BackHeader title="Search results" to="/" />
      <div className="mt-5 lg:mt-0">
        <SearchBox key={query} initial={query} />
      </div>
      {!query ? (
        <div className="mt-6">
          <EmptyState title="What did you lose?" body="Describe it in plain words, like “black Dell charger with blue tape”." />
        </div>
      ) : isLoading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError || !data ? (
        <div className="mt-6">
          <EmptyState title="Search failed" body="Something went wrong. Try again in a moment." />
        </div>
      ) : (
        <>
          {understood.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[15px] text-muted-ink">
              <IconSparkles size={18} className="text-brand" aria-hidden />
              <span>{data.usedAi ? "Gemini understood:" : "Searching for:"}</span>
              {understood.map((u) => <Tag key={u}>{u}</Tag>)}
            </div>
          ) : null}
          <h2 className="mb-4 mt-5 text-xl font-bold text-ink">
            {count} possible {count === 1 ? "match" : "matches"}
          </h2>
          {count === 0 ? (
            <EmptyState title="No matches yet" body="Nobody has posted an item like that. Check back later — new items are posted every day." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.results.map((item) => (
                <ItemCard key={item.id} item={item} pill={item.match === "best" ? "best" : "possible"} to={`/items/${item.id}`} />
              ))}
            </div>
          )}
        </>
      )}
    </AppPage>
  );
}
