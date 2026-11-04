import { IconCheck } from "@tabler/icons-react";

import { AppPage } from "@/components/campus/shell";
import { BackHeader, BtnLink } from "@/components/campus/ui";

export function meta() {
  return [{ title: "Item posted · CampusLost&Found" }];
}

export default function ReportDone() {
  return (
    <AppPage title="Report found item">
      <BackHeader title="Posted" to="/" />
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center lg:min-h-0 lg:pt-16">
        <span className="grid size-[68px] place-items-center rounded-full bg-amber text-brand lg:size-[74px]">
          <IconCheck size={34} stroke={2.25} />
        </span>
        <h1 className="mt-5 text-[32px] font-bold text-ink lg:text-[28px]">Item posted</h1>
        <p className="mt-3 max-w-[320px] text-[17px] text-muted-ink lg:text-[15px]">
          Owners can now find it. We will notify you when someone claims it.
        </p>
        <div className="mt-5 flex w-auto flex-col items-center gap-4">
          <BtnLink to="/posts" className="w-auto px-9">View my posts</BtnLink>
          <BtnLink to="/report" variant="secondary" className="w-auto px-9">Report another</BtnLink>
        </div>
      </div>
    </AppPage>
  );
}
