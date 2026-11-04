import { IconMapPin } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { ClaimChat } from "@/components/campus/claim-chat";
import { MapPreview } from "@/components/campus/map-pin";
import { AppPage } from "@/components/campus/shell";
import { BackHeader, Btn, BtnLink, EmptyState, Notice, PhotoBox, Pill, Tag } from "@/components/campus/ui";
import { dayAndTime, errorMessage, itemTags } from "@/lib/campus";
import { useCreateClaim, useItem, useMyProfile, useReportItem } from "@/lib/campus-data";

export function meta() {
  return [{ title: "Item details · CampusLost&Found" }];
}

function ReportPost({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const report = useReportItem();
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-11 self-center text-sm font-bold text-link hover:underline">
        Report this post
      </button>
    );
  }
  return (
    <form
      className="flex flex-col gap-2 rounded-xl border border-divider p-4"
      onSubmit={(e) => {
        e.preventDefault();
        report.mutate(
          { itemId, reason },
          {
            onSuccess: () => {
              toast.success("Thanks. We'll take a look at this post.");
              setOpen(false);
              setReason("");
            },
            onError: (err) => toast.error(errorMessage(err)),
          },
        );
      }}
    >
      <label htmlFor="report-reason" className="text-sm font-bold text-muted-ink">What's wrong with this post?</label>
      <input
        id="report-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-12 rounded-xl border border-line px-4 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-link/30"
        placeholder="e.g. Fake post, shows personal details"
      />
      <div className="flex gap-2">
        <Btn type="button" variant="secondary" className="h-11 text-[15px]" onClick={() => setOpen(false)}>Cancel</Btn>
        <Btn type="submit" className="h-11 text-[15px]" disabled={reason.trim().length < 3 || report.isPending}>Send report</Btn>
      </div>
    </form>
  );
}

export default function ItemDetails() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useItem(id);
  const claim = useCreateClaim();
  const { data: me } = useMyProfile();

  if (isLoading) {
    return (
      <AppPage title="Home">
        <BackHeader title="Item details" />
        <div className="mt-5 grid gap-8 lg:mt-0 lg:grid-cols-2">
          <div className="h-[296px] animate-pulse rounded-2xl bg-photo lg:h-[328px]" />
          <div className="flex flex-col gap-3">
            <div className="h-8 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-surface" />
          </div>
        </div>
      </AppPage>
    );
  }
  if (isError || !data) {
    return (
      <AppPage title="Home">
        <BackHeader title="Item details" />
        <div className="mt-5"><EmptyState title="Item not found" body="It may have been removed." action={<BtnLink to="/">Back to Home</BtnLink>} /></div>
      </AppPage>
    );
  }

  const { item, myClaim } = data;
  const tags = itemTags(item);

  function submit(proofText: string) {
    claim.mutate(
      { itemId: item.id, proofText },
      {
        onSuccess: () => {
          toast.success("Claim sent. We'll let you know when the finder decides.");
          navigate("/claims");
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  }

  let claimArea: React.ReactNode;
  if (item.isMine) {
    claimArea = (
      <Notice icon="none">
        You posted this item. <Link to="/posts" className="font-bold text-link hover:underline">Manage it in My posts</Link>.
      </Notice>
    );
  } else if (myClaim?.status === "pending") {
    claimArea = <Notice icon="none">Your claim is pending. The finder will review your proof soon.</Notice>;
  } else if (myClaim?.status === "approved") {
    claimArea = <BtnLink to={`/claims/${myClaim.id}`}>See handover details</BtnLink>;
  } else if (item.status !== "found") {
    claimArea = <Notice icon="none">This item has already been claimed.</Notice>;
  } else {
    claimArea = (
      <ClaimChat
        itemId={item.id}
        category={item.category}
        firstName={me?.profile?.fullName.trim().split(/\s+/)[0] || "there"}
        previouslyRejected={myClaim?.status === "rejected"}
        submitting={claim.isPending}
        onSubmit={submit}
      />
    );
  }

  return (
    <AppPage title="Home">
      <BackHeader title="Item details" />
      <div className="mt-5 grid gap-6 lg:mt-0 lg:grid-cols-2 lg:gap-8">
        <PhotoBox src={item.photo} alt={item.title} label="Photo of the item" className="h-[296px] w-full rounded-2xl lg:h-[328px]" />
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[32px] font-bold leading-tight text-ink lg:text-[28px]">{item.title}</h1>
            <span className="mt-2"><Pill kind={item.status === "found" ? "found" : item.status === "returned" ? "returned" : "claimed"} /></span>
          </div>
          {tags.length ? <div className="flex flex-wrap gap-2">{tags.map((t) => <Tag key={t}>{t}</Tag>)}</div> : null}
          <p className="flex items-center gap-2 text-[17px] text-muted-ink">
            <IconMapPin size={22} className="shrink-0 text-ink" /> {item.location} · {dayAndTime(item.foundAt)}
          </p>
          {item.pin ? <MapPreview pin={item.pin} title={`Map of where the ${item.title} was found`} /> : null}
          {item.summary ? <p className="text-[15px] text-muted-ink">{item.summary}</p> : null}
          {!item.isMine ? <Notice>The finder's contact stays hidden until they approve your claim.</Notice> : null}
          {claimArea}
          {!item.isMine ? <ReportPost itemId={item.id} /> : null}
        </div>
      </div>
    </AppPage>
  );
}
