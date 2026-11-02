import { useActionQuery } from "@agent-native/core/client/hooks";
import { IconBrandWhatsapp, IconCheck, IconHome, IconPhone } from "@tabler/icons-react";
import { useParams } from "react-router";

import { AppPage } from "@/components/campus/shell";
import { BackHeader, BtnLink, EmptyState, ItemCard, Notice, Stepper } from "@/components/campus/ui";

export function meta() {
  return [{ title: "Handover · CampusLost&Found" }];
}

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("0") ? `234${digits.slice(1)}` : digits}`;
}

export default function ClaimHandover() {
  const { claimId = "" } = useParams();
  const { data, isLoading, isError } = useActionQuery("get-handover-contact", { claimId });

  return (
    <AppPage title="My claims">
      <BackHeader title="Handover" to="/claims" />
      {isLoading ? (
        <div className="mt-5 h-40 animate-pulse rounded-2xl bg-surface lg:mt-0" />
      ) : isError || !data ? (
        <div className="mt-5 lg:mt-0"><EmptyState title="Claim not found" body="It may have been removed." action={<BtnLink to="/claims">Back to My claims</BtnLink>} /></div>
      ) : (
        <div className="mt-5 grid gap-6 lg:mt-0 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col gap-5">
            <Stepper steps={["Found", "Claimed", "Returned"]} current={data.item.status === "returned" ? 3 : data.status === "approved" ? 2 : 1} />
            <ItemCard item={data.item} pill={data.status === "approved" ? "approved" : data.status === "rejected" ? "rejected" : "pending"} />
          </div>
          {data.contact ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="grid size-[52px] place-items-center rounded-full bg-amber text-brand"><IconCheck size={24} stroke={2.25} /></span>
                <h2 className="text-[26px] font-bold text-ink">Claim approved</h2>
              </div>
              <p className="text-[17px] text-muted-ink lg:text-[15px]">
                Contact {data.contact.fullName.split(" ")[0]} to arrange the handover. Meet in a public campus spot, like the library or the main gate.
              </p>
              <div className="flex flex-col divide-y divide-divider rounded-2xl bg-surface">
                <div className="flex items-center gap-3 px-5 py-4"><IconPhone size={20} className="text-brand" /><span className="font-bold text-ink">{data.contact.phone}</span></div>
                <div className="flex items-center gap-3 px-5 py-4"><IconHome size={20} className="text-brand" /><span className="text-ink">{data.contact.residence}</span></div>
              </div>
              <a
                href={waLink(data.contact.phone)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-brand text-[17px] font-bold text-white hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/50"
              >
                <IconBrandWhatsapp size={22} /> Message on WhatsApp
              </a>
            </div>
          ) : (
            <Notice>The finder's contact stays hidden until they approve your claim.</Notice>
          )}
        </div>
      )}
    </AppPage>
  );
}
