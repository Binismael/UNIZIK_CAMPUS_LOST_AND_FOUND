import {
  IconCamera,
  IconCheck,
  IconChevronLeft,
  IconEye,
  IconEyeOff,
  IconLock,
  IconSearch,
} from "@tabler/icons-react";
import { forwardRef, useId, useState } from "react";
import { Link, useNavigate } from "react-router";

import { cn } from "@/lib/utils";
import { itemTags, relativeTime } from "@/lib/campus";

type BtnVariant = "primary" | "secondary" | "amber" | "ghost-dark";

const btnStyles: Record<BtnVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  secondary: "border-2 border-brand bg-white text-brand hover:bg-surface",
  amber: "bg-amber text-brand hover:brightness-95",
  "ghost-dark": "border-2 border-white/30 bg-transparent text-white hover:bg-white/10",
};

export const Btn = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }
>(function Btn({ variant = "primary", className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 text-[17px] font-bold transition-colors",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/50 disabled:opacity-60",
        btnStyles[variant],
        className,
      )}
      {...props}
    />
  );
});

export function BtnLink({
  to,
  variant = "primary",
  className,
  children,
}: {
  to: string;
  variant?: BtnVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center rounded-xl px-6 text-[17px] font-bold transition-colors",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/50",
        btnStyles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

const fieldBase =
  "w-full rounded-xl border border-line bg-white px-4 text-[17px] text-ink placeholder:text-muted-ink/70 focus:outline-none focus:ring-[3px] focus:ring-link/30 focus:border-link";

export function Field({
  label,
  error,
  children,
  htmlFor,
}: {
  label: string;
  error?: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-bold text-muted-ink">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export const TextInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | undefined }
>(function TextInput({ label, error, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field label={label} error={error} htmlFor={inputId}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, "h-12 read-only:bg-surface", className)}
        {...props}
      />
    </Field>
  );
});

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; error?: string | undefined }
>(function PasswordInput({ label, error, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [shown, setShown] = useState(false);
  return (
    <Field label={label} error={error} htmlFor={inputId}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={shown ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className={cn(fieldBase, "h-12 pr-14", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="absolute inset-y-0 right-1 my-auto grid size-11 place-items-center rounded-lg text-muted-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link"
        >
          {shown ? <IconEyeOff size={20} /> : <IconEye size={20} />}
        </button>
      </div>
    </Field>
  );
});

export const SelectInput = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    error?: string | undefined;
    placeholder: string;
    options: readonly string[];
  }
>(function SelectInput({ label, error, placeholder, options, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field label={label} error={error} htmlFor={inputId}>
      <select
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, "h-12 pr-3", className)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
});

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber text-brand">
        <IconSearch size={18} stroke={2.5} />
      </span>
      <span className={cn("text-[19px] font-bold tracking-tight", light ? "text-white" : "text-ink")}>
        CampusLost&amp;Found
      </span>
    </span>
  );
}

export type PillKind =
  | "found"
  | "pending"
  | "approved"
  | "rejected"
  | "returned"
  | "new-claim"
  | "best"
  | "possible"
  | "no-claims"
  | "claimed";

const pillMap: Record<PillKind, { label: string; cls: string }> = {
  found: { label: "Found", cls: "bg-amber text-brand" },
  pending: { label: "Pending", cls: "bg-amber text-brand" },
  "new-claim": { label: "New claim", cls: "bg-amber text-brand" },
  best: { label: "Best match", cls: "bg-amber text-brand" },
  approved: { label: "Approved", cls: "bg-brand text-white" },
  returned: { label: "Returned", cls: "bg-brand text-white" },
  rejected: { label: "Rejected", cls: "bg-divider/70 text-muted-ink" },
  possible: { label: "Possible match", cls: "text-brand" },
  "no-claims": { label: "No claims", cls: "text-brand" },
  claimed: { label: "Claimed", cls: "text-brand" },
};

export function Pill({ kind }: { kind: PillKind }) {
  const p = pillMap[kind];
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-bold", p.cls)}>
      {p.label}
    </span>
  );
}

export function Tag({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[13px] font-bold",
        dark ? "bg-white/10 text-white" : "bg-surface text-brand",
      )}
    >
      {children}
    </span>
  );
}

export function PhotoBox({
  src,
  alt,
  className,
  label,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  label?: string;
}) {
  if (src) {
    return <img src={src} alt={alt} className={cn("rounded-xl bg-photo object-cover", className)} />;
  }
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl bg-photo text-muted-ink", className)}>
      <IconCamera size={label ? 36 : 28} stroke={2} />
      {label ? <span className="text-[15px]">{label}</span> : null}
    </div>
  );
}

export type CardItem = {
  id: string;
  title: string;
  colors: string[];
  brand: string;
  marks: string;
  location: string;
  foundAt: string;
  photo: string | null;
};

export function ItemCard({
  item,
  pill,
  to,
  footer,
  className,
}: {
  item: CardItem;
  pill?: PillKind | undefined;
  to?: string | undefined;
  footer?: React.ReactNode;
  className?: string | undefined;
}) {
  const body = (
    <div className={cn("flex gap-4 rounded-2xl bg-surface p-3 lg:p-3", to && "transition-colors hover:bg-divider/60", className)}>
      <PhotoBox src={item.photo} alt={item.title} className="size-[74px] shrink-0 lg:size-[74px]" />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[17px] font-bold leading-tight text-ink">{item.title}</h3>
          {pill ? <Pill kind={pill} /> : null}
        </div>
        <p className="mt-0.5 truncate text-[15px] text-muted-ink">{itemTags(item).join(" · ")}</p>
        <p className="truncate text-sm text-muted-ink">
          {item.location} · {relativeTime(item.foundAt)}
        </p>
        {footer ? <div className="mt-0.5 text-sm text-ink">{footer}</div> : null}
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40">
      {body}
    </Link>
  ) : (
    body
  );
}

export function CardSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl bg-surface p-3">
      <div className="size-[74px] shrink-0 animate-pulse rounded-xl bg-photo" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-4 w-2/3 animate-pulse rounded bg-photo" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-photo" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-photo" />
      </div>
    </div>
  );
}

export function Notice({ children, icon = "lock" }: { children: React.ReactNode; icon?: "lock" | "none" }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface px-4 py-3 text-[15px] leading-snug text-muted-ink">
      {icon === "lock" ? <IconLock size={16} className="mt-0.5 shrink-0 text-brand" /> : null}
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <p className="text-lg font-bold text-ink">{title}</p>
      <p className="max-w-sm text-[15px] text-muted-ink">{body}</p>
      {action ? <div className="mt-3 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-start">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className={cn("flex items-start", i < steps.length - 1 && "flex-1")}>
            <div className="flex w-[72px] flex-col items-center gap-1.5 text-center">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "grid size-[34px] place-items-center rounded-full",
                  done && "bg-brand text-white",
                  active && "bg-amber",
                  !done && !active && "border-2 border-line bg-white",
                )}
              >
                {done ? <IconCheck size={16} stroke={2.5} /> : null}
              </span>
              <span className={cn("text-sm leading-tight text-ink", active && "font-bold")}>{label}</span>
            </div>
            {i < steps.length - 1 ? <span className="mt-4 h-0.5 flex-1 bg-line" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function BackHeader({ title, to }: { title: string; to?: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4 lg:hidden">
      <button
        type="button"
        aria-label="Go back"
        onClick={() => (to ? navigate(to) : navigate(-1))}
        className="grid size-11 place-items-center rounded-full bg-surface text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40"
      >
        <IconChevronLeft size={22} />
      </button>
      <h1 className="text-[22px] font-bold text-ink">{title}</h1>
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-brand font-bold text-white", className)}>
      {initials(name)}
    </span>
  );
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function shortName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[1]?.[0] ?? ""}.`;
}
