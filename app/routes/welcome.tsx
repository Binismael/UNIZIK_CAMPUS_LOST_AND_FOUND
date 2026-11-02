import { IconCamera, IconClipboardCheck, IconSparkles } from "@tabler/icons-react";

import { BtnLink, Logo } from "@/components/campus/ui";

export function meta() {
  return [{ title: "CampusLost&Found" }];
}

const STEPS = [
  { title: "Snap", body: "Found something? Photograph it.", Icon: IconCamera },
  { title: "Search", body: "Gemini tags it. Owners search in plain words.", Icon: IconSparkles },
  { title: "Claim", body: "Owners prove it is theirs. Finders approve.", Icon: IconClipboardCheck },
];

export default function Welcome() {
  return (
    <>
      <div className="flex min-h-full flex-col bg-brand px-6 pb-8 pt-12 lg:hidden">
        <Logo light />
        <div className="mt-auto pt-16">
          <h1 className="font-display text-[40px] font-bold leading-[1.12] text-white">
            Find what you lost. Return what you found.
          </h1>
          <ul className="mt-8 flex flex-col gap-6">
            {STEPS.map(({ title, body, Icon }) => (
              <li key={title} className="flex items-center gap-5">
                <span className="grid size-[60px] shrink-0 place-items-center rounded-full bg-brand-soft text-amber">
                  <Icon size={26} stroke={2} />
                </span>
                <span>
                  <span className="block text-lg font-bold text-white">{title}</span>
                  <span className="block text-[17px] leading-snug text-white/70">{body}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-4">
            <BtnLink to="/create-account" variant="amber">
              Get started
            </BtnLink>
            <BtnLink to="/signin" variant="ghost-dark">
              I already have an account
            </BtnLink>
          </div>
        </div>
      </div>

      <div className="hidden min-h-full lg:flex">
        <section className="flex w-1/2 flex-col justify-center bg-brand px-14">
          <Logo light />
          <h1 className="mt-8 max-w-[560px] font-display text-[46px] font-bold leading-[1.1] text-white">
            Find what you lost. Return what you found.
          </h1>
          <p className="mt-8 text-lg text-white/75">Lost and found for UNIZIK students, powered by Gemini.</p>
        </section>
        <section className="flex flex-1 items-center bg-white px-14">
          <div className="w-full max-w-[545px]">
            <h2 className="text-[28px] font-bold text-ink">How it works</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {STEPS.map(({ title, body, Icon }) => (
                <li key={title} className="flex items-center gap-4">
                  <span className="grid size-[50px] shrink-0 place-items-center rounded-full bg-surface text-brand">
                    <Icon size={22} stroke={2} />
                  </span>
                  <span>
                    <span className="block text-lg font-bold text-ink">{title}</span>
                    <span className="block text-[15px] text-muted-ink">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col gap-5">
              <BtnLink to="/create-account">Get started</BtnLink>
              <BtnLink to="/signin" variant="secondary">
                I already have an account
              </BtnLink>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
