import { IconChevronLeft, IconCoinOff } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router";

import { Logo } from "@/components/campus/ui";
import { HELP_EMAIL } from "@/lib/campus-options";

export function meta() {
  return [{ title: "Terms and Conditions · CampusLost&Found" }];
}

const SECTIONS: { title: string; points: string[] }[] = [
  {
    title: "1. What this app is for",
    points: [
      "CampusLost&Found helps UNIZIK students return lost items to their owners. That is all it is for.",
      "It is not a marketplace. You may not use it to advertise, buy, sell, swap or rent anything.",
    ],
  },
  {
    title: "2. No payments, ever",
    points: [
      "Returning an item is always free. A finder must never ask for money, airtime, gifts or any other reward to hand an item back.",
      "An owner must never be asked to pay for, or buy back, their own item. If someone asks you to pay, do not pay. Report the post in the app.",
      "CampusLost&Found never charges fees and never handles money between students.",
    ],
  },
  {
    title: "3. Item photos are private",
    points: [
      "When you post a found item, only you can see its photo. Other students see a written description.",
      "The owner sees the photo only after you approve their claim. This stops people copying details from a photo to make a false claim, and stops photos being used to sell items.",
      "Don't put private details like ID numbers, bank cards or phone screens in item descriptions.",
    ],
  },
  {
    title: "4. Claims must be honest",
    points: [
      "Only claim an item that is really yours. Your proof must be true.",
      "Finders should only approve a claim when the proof matches the item they are holding.",
      "False claims, or keeping or selling an item you found, can be reported to the university authorities.",
    ],
  },
  {
    title: "5. Safe handovers",
    points: [
      "Meet in a busy, public place on campus, such as a faculty office, library or security post.",
      "Check the item together before you part ways, then mark it as returned in the app.",
    ],
  },
  {
    title: "6. Your account",
    points: [
      "Use your real name and campus details. Your phone number and hostel are only shared with the other student after a claim is approved.",
      "We may remove posts or suspend accounts that break these terms, including anyone who asks for money or tries to buy or sell.",
    ],
  },
];

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-white lg:bg-surface lg:py-10">
      <div className="mx-auto max-w-[720px] px-5 pb-12 pt-5 lg:rounded-3xl lg:bg-white lg:px-10 lg:py-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-ink hover:bg-divider/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40"
          >
            <IconChevronLeft size={22} />
          </button>
          <Logo />
        </div>

        <h1 className="mt-8 font-display text-[32px] font-bold leading-tight text-ink">Terms and Conditions</h1>
        <p className="mt-2 text-[17px] text-muted-ink">Please read these before you post or claim an item.</p>

        <div className="mt-6 flex items-start gap-4 rounded-2xl bg-brand px-5 py-5 text-white">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber text-brand">
            <IconCoinOff size={22} aria-hidden />
          </span>
          <div>
            <p className="text-lg font-bold">Don't pay for any lost item.</p>
            <p className="mt-1 text-[15px] leading-snug text-white/80">
              Nobody buys or sells here. Getting your item back is free, and finders return items for free. If anyone asks you for money,
              don't pay. Report them.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-7">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-ink">{s.title}</h2>
              <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-[16px] leading-relaxed text-muted-ink marker:text-brand">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-divider pt-5 text-[15px] text-muted-ink">
          Questions or something to report? Email{" "}
          <a href={`mailto:${HELP_EMAIL}`} className="font-bold text-link hover:underline">
            {HELP_EMAIL}
          </a>
          . By creating an account you agree to these terms.
        </p>
        <p className="mt-4 text-sm text-muted-ink">
          <Link to="/" className="font-bold text-link hover:underline">Back to CampusLost&amp;Found</Link>
        </p>
      </div>
    </div>
  );
}
