import { IconPhoto, IconSparkles } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { AppPage } from "@/components/campus/shell";
import { BackHeader, Btn } from "@/components/campus/ui";
import { compressImage, errorMessage, reportDraft } from "@/lib/campus";
import { cn } from "@/lib/utils";

export function meta() {
  return [{ title: "Report found item · CampusLost&Found" }];
}

export default function ReportPhoto() {
  const navigate = useNavigate();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("That photo is too large. Try one under 15 MB.");
      return;
    }
    setBusy(true);
    try {
      reportDraft.set(await compressImage(file));
      navigate("/report/review");
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <AppPage title="Report found item">
      <BackHeader title="Report found item" to="/" />
      <p className="mt-5 rounded-full bg-surface px-5 py-1 text-sm font-bold text-brand lg:mt-0">Step 1 of 2</p>
      <h2 className="mb-5 mt-4 text-[32px] font-bold text-ink lg:text-[26px]">Add a photo</h2>
      <button
        type="button"
        disabled={busy}
        onClick={() => galleryRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex h-[300px] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-line bg-surface text-muted-ink transition-colors lg:h-[250px]",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/40",
          dragging && "border-link bg-divider/50",
        )}
      >
        <IconPhoto size={52} stroke={1.8} className="text-brand" />
        <span className="text-[17px]">{busy ? "Preparing photo…" : "Drop a photo here or tap to upload"}</span>
      </button>
      <div className="mt-6 flex flex-col gap-5">
        <Btn type="button" disabled={busy} onClick={() => cameraRef.current?.click()}>Take photo</Btn>
        <Btn type="button" variant="secondary" disabled={busy} onClick={() => galleryRef.current?.click()}>Choose from gallery</Btn>
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface px-5 py-4 text-[17px] text-muted-ink lg:text-[15px]">
        <IconSparkles size={18} className="mt-0.5 shrink-0 text-brand" />
        Show the whole item in good light. Hide personal details like ID numbers.
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
    </AppPage>
  );
}
