import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { IconCheck } from "@tabler/icons-react";
import { useParams } from "react-router";
import { toast } from "sonner";

import { AppPage } from "@/components/campus/shell";
import { BackHeader, Btn, BtnLink, EmptyState, ItemCard, Stepper, shortName } from "@/components/campus/ui";
import { errorMessage } from "@/lib/campus";

export function meta() {
  return [{ title: "Handover · CampusLost&Found" }];
}

export default function Handover() {
  const { itemId = "" } = useParams();
  const { data, isLoading, isError } = useActionQuery("get-post", { itemId });
  const markReturned = useActionMutation("mark-returned");

  if (isLoading) {
    return (
      <AppPage title="My posts">
        <BackHeader title="Handover" to="/posts" />
        <div className="mt-5 h-48 animate-pulse rounded-2xl bg-surface lg:mt-0" />
      </AppPage>
    );
  }
  const approved = data?.claims.find((c) => c.status === "approved");
  if (isError || !data || !approved) {
    return (
      <AppPage title="My posts">
        <BackHeader title="Handover" to="/posts" />
        <div className="mt-5 lg:mt-0"><EmptyState title="No approved claim" body="Approve a claim on this item first." action={<BtnLink to="/posts">Back to My posts</BtnLink>} /></div>
      </AppPage>
    );
  }

  const returned = data.item.status === "returned";
  const name = shortName(approved.claimant.fullName);

  return (
    <AppPage title="My posts">
      <BackHeader title="Handover" to="/posts" />
      <div className="mt-5 grid gap-5 lg:mt-0 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-5">
          <Stepper steps={["Found", "Claimed", "Returned"]} current={returned ? 3 : 2} />
          <ItemCard item={data.item} pill={returned ? "returned" : "approved"} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-[52px] place-items-center rounded-full bg-amber text-brand"><IconCheck size={24} stroke={2.25} /></span>
            <h2 className="text-[30px] font-bold text-ink lg:text-[26px]">{returned ? "Item returned" : "Claim approved"}</h2>
          </div>
          <p className="text-[17px] leading-snug text-muted-ink lg:text-[15px]">
            {returned
              ? `Thanks for getting this back to ${name}. You made someone's day.`
              : `${name} now sees your contact. Meet in a public campus spot, like the library or the main gate.`}
          </p>
          {returned ? (
            <BtnLink to="/posts" variant="secondary">Back to My posts</BtnLink>
          ) : (
            <Btn
              disabled={markReturned.isPending}
              onClick={() =>
                markReturned.mutate(
                  { itemId },
                  {
                    onSuccess: () => toast.success("Marked as returned."),
                    onError: (err) => toast.error(errorMessage(err)),
                  },
                )
              }
            >
              {markReturned.isPending ? "Saving…" : "Mark as returned"}
            </Btn>
          )}
        </div>
      </div>
    </AppPage>
  );
}
