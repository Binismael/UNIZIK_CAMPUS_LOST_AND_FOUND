import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex h-14 items-center gap-4 rounded-2xl bg-surface px-5 focus-within:ring-[3px] focus-within:ring-link/30"
    >
      <IconSearch size={22} className="shrink-0 text-muted-ink" aria-hidden />
      <label htmlFor="item-search" className="sr-only">
        Describe what you lost
      </label>
      <input
        id="item-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="black Dell charger with blue tape"
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-ink placeholder:text-muted-ink/70 focus:outline-none"
      />
    </form>
  );
}
