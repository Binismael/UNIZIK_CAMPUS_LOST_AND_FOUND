import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { AppPage } from "@/components/campus/shell";
import { Avatar, BackHeader, Btn, BtnLink, EmptyState, ItemCard, Notice, Stepper, shortName } from "@/components/campus/ui";
import { errorMessage, parseClaimProof } from "@/lib/campus";
import { useDecideClaim, usePost } from "@/lib/campus-data";

export function meta() {
  return [{ title: "Claim to review · CampusLost&Found" }];
}

export default function ClaimReview() {
  const { itemId = "", claimId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePost(itemId);
  const decide = useDecideClaim();

  if (isLoading) {
    return (
      <AppPage title="My posts">
        <BackHeader title="Claim to review" to="/posts" />
        <div className="mt-5 h-48 animate-pulse rounded-2xl bg-surface lg:mt-0" />
      </AppPage>
    );
  }
  const claim = data?.claims.find((c) => c.id === claimId);
  if (isError || !data || !claim) {
    return (
      <AppPage title="My posts">
        <BackHeader title="Claim to review" to="/posts" />
        <div className="mt-5 lg:mt-0"><EmptyState title="Claim not found" body="It may have been withdrawn." action={<BtnLink to="/posts">Back to My posts</BtnLink>} /></div>
      </AppPage>
    );
  }

  const name = shortName(claim.claimant.fullName);
  const firstName = claim.claimant.fullName.split(" ")[0];
  const meta = [claim.claimant.department, claim.claimant.level && `${claim.claimant.level} level`].filter(Boolean).join(", ");
  const pairs = parseClaimProof(claim.proofText);

  function onDecide(decision: "approve" | "reject") {
    decide.mutate(
      { claimId, decision },
      {
        onSuccess: () => {
          if (decision === "approve") navigate(`/posts/${itemId}/handover`);
          else {
            toast.success("Claim rejected.");
            navigate("/posts");
          }
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  }

  return (
    <AppPage title="My posts">
      <BackHeader title="Claim to review" to="/posts" />
      <div className="mt-5 grid gap-5 lg:mt-0 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col gap-5">
          <Stepper steps={["Found", "Claimed", "Returned"]} current={1} />
          <ItemCard item={data.item} pill="claimed" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-surface p-5">
            <div className="flex items-center gap-4">
              <Avatar name={claim.claimant.fullName} className="size-[52px] text-lg" />
              <div>
                <p className="text-lg font-bold text-ink">{name}</p>
                <p className="text-[15px] text-muted-ink">{meta}</p>
              </div>
            </div>
            {pairs ? (
              <>
                <p className="mt-4 text-sm text-muted-ink">Answers to the claim assistant. Check them against the item.</p>
                <dl className="mt-3 flex flex-col gap-3">
                  {pairs.map(({ q, a }) => (
                    <div key={q} className="rounded-xl bg-white p-4">
                      <dt className="text-[15px] text-muted-ink">{q}</dt>
                      <dd className="mt-1 whitespace-pre-line break-words text-[18px] font-bold leading-snug text-ink lg:text-[17px]">{a}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-muted-ink">Proof from the owner</p>
                <p className="mt-2 whitespace-pre-line text-[19px] leading-snug text-ink lg:text-[17px]">{claim.proofText}</p>
              </>
            )}
          </div>
          {claim.status === "pending" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Btn variant="secondary" disabled={decide.isPending} onClick={() => onDecide("reject")}>Reject</Btn>
                <Btn disabled={decide.isPending} onClick={() => onDecide("approve")}>Approve</Btn>
              </div>
              <Notice>Approving shares your contact with {firstName} so you can hand it over.</Notice>
            </>
          ) : (
            <Notice icon="none">You {claim.status} this claim.</Notice>
          )}
        </div>
      </div>
    </AppPage>
  );
}
