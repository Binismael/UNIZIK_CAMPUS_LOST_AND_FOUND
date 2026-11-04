import { IconSparkles } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { AppPage } from "@/components/campus/shell";
import { BackHeader, Btn, PhotoBox, TextInput } from "@/components/campus/ui";
import { CATEGORIES, errorMessage, guessCategory, reportDraft, type Category } from "@/lib/campus";
import { useCreateItem, useTagItem } from "@/lib/campus-data";

export function meta() {
  return [{ title: "Report found item · CampusLost&Found" }];
}

type Form = { title: string; colour: string; brand: string; marks: string; location: string };

export default function ReportReview() {
  const navigate = useNavigate();
  const [photo] = useState(() => reportDraft.get());
  const tag = useTagItem();
  const create = useCreateItem();
  const started = useRef(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [summary, setSummary] = useState("");
  const [aiState, setAiState] = useState<"loading" | "filled" | "failed">("loading");
  const [form, setForm] = useState<Form>({ title: "", colour: "", brand: "", marks: "", location: "" });

  useEffect(() => {
    if (!photo) {
      navigate("/report", { replace: true });
      return;
    }
    if (started.current) return;
    started.current = true;
    tag.mutate(
      photo,
      {
        onSuccess: ({ tags }) => {
          if (!tags) {
            setAiState("failed");
            return;
          }
          setForm((f) => ({ ...f, title: tags.title, colour: tags.colors.join(", "), brand: tags.brand, marks: tags.marks }));
          setCategory((CATEGORIES as readonly string[]).includes(tags.category) ? (tags.category as Category) : null);
          setSummary(tags.summary);
          setAiState("filled");
        },
        onError: () => setAiState("failed"),
      },
    );
  }, [photo, navigate, tag]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canPost = form.title.trim().length >= 2 && form.location.trim().length >= 2 && aiState !== "loading";

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!canPost) return;
    create.mutate(
      {
        title: form.title.trim(),
        category: category ?? guessCategory(`${form.title} ${summary}`),
        colors: form.colour.split(",").map((c) => c.trim()).filter(Boolean),
        brand: form.brand.trim(),
        marks: form.marks.trim(),
        summary: summary.trim(),
        location: form.location.trim(),
        photo,
      },
      {
        onSuccess: () => {
          reportDraft.clear();
          navigate("/report/done", { replace: true });
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  }

  if (!photo) return null;

  return (
    <AppPage title="Report found item">
      <BackHeader title="Report found item" to="/report" />
      <div className="mt-5 grid gap-6 lg:mt-0 lg:grid-cols-2 lg:gap-8">
        <div>
          <p className="rounded-full bg-surface px-5 py-1 text-sm font-bold text-brand">Step 2 of 2</p>
          <PhotoBox src={photo} alt="Photo of the found item" className="mt-4 h-[280px] w-full rounded-2xl lg:h-[287px]" />
        </div>
        <form onSubmit={post} className="flex flex-col gap-4" noValidate>
          {aiState === "loading" ? (
            <div className="flex flex-col gap-4" role="status" aria-label="Gemini is tagging your photo">
              <div className="flex items-center gap-3 rounded-2xl bg-brand px-5 py-4 text-[15px] text-white">
                <IconSparkles size={20} className="animate-pulse text-amber" /> Gemini is looking at your photo…
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-4 w-16 animate-pulse rounded bg-surface" />
                    <div className="h-12 animate-pulse rounded-xl bg-surface" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {aiState === "filled" ? (
                <div className="flex items-center gap-3 rounded-2xl bg-brand px-5 py-4 text-[17px] text-white lg:text-[15px]">
                  <IconSparkles size={20} className="shrink-0 text-amber" /> Gemini filled these in. Check and edit before posting.
                </div>
              ) : (
                <div className="rounded-2xl bg-surface px-5 py-4 text-[15px] text-muted-ink">
                  Gemini couldn't tag this photo right now. Type the details in below.
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                <TextInput label="Type" value={form.title} onChange={set("title")} placeholder="e.g. Laptop charger" maxLength={60} />
                <TextInput label="Colour" value={form.colour} onChange={set("colour")} placeholder="e.g. Black" maxLength={60} />
                <TextInput label="Brand (optional)" value={form.brand} onChange={set("brand")} placeholder="e.g. Dell" maxLength={40} />
                <TextInput label="Marks (optional)" value={form.marks} onChange={set("marks")} placeholder="e.g. Blue tape" maxLength={80} />
              </div>
            </>
          )}
          <div className="flex flex-col gap-1.5">
            <TextInput label="Where did you find it?" value={form.location} onChange={set("location")} placeholder="e.g. Block C, Engineering" maxLength={80} />
            <p className="text-sm text-muted-ink">Gemini can't tell this from the photo, so type the spot yourself.</p>
          </div>
          <Btn type="submit" disabled={!canPost || create.isPending}>
            {create.isPending ? "Posting…" : "Post found item"}
          </Btn>
          {!canPost && aiState !== "loading" ? (
            <p className="-mt-2 text-center text-sm text-muted-ink">
              {form.title.trim().length < 2 ? "Add the item type to post." : "Add where you found it to post."}
            </p>
          ) : null}
        </form>
      </div>
    </AppPage>
  );
}
