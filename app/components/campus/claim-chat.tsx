import { IconArrowUp, IconSparkles } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { formatClaimProof } from "@/lib/campus";
import { useClaimQuestions } from "@/lib/campus-data";
import { cn } from "@/lib/utils";

import { Btn } from "./ui";

const MAX_ANSWER = 200;

function AssistantAvatar() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-amber text-brand" aria-hidden>
      <IconSparkles size={18} stroke={2.2} />
    </span>
  );
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <AssistantAvatar />
      <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-surface px-4 py-3 text-[16px] leading-snug text-ink">{children}</p>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <p className="ml-auto max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-br-md bg-brand px-4 py-3 text-[16px] leading-snug text-white">
      {children}
    </p>
  );
}

function Typing() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="Claim assistant is typing">
      <AssistantAvatar />
      <span className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-4">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="size-2 animate-bounce rounded-full bg-muted-ink/60 motion-reduce:animate-none" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
    </div>
  );
}

function Conversation({
  itemId,
  category,
  firstName,
  previouslyRejected,
  submitting,
  onSubmit,
}: {
  itemId: string;
  category: string;
  firstName: string;
  previouslyRejected: boolean;
  submitting: boolean;
  onSubmit: (proof: string) => void;
}) {
  const { data } = useClaimQuestions(itemId, category, true);
  const questions = data?.questions ?? [];
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const ready = questions.length > 0 && !thinking;
  const done = ready && answers.length >= questions.length;
  const canSend = ready && !done && draft.trim().length >= 2;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [answers.length, ready]);

  useEffect(() => {
    if (ready && !done) inputRef.current?.focus({ preventScroll: true });
  }, [ready, done]);

  function send() {
    if (!canSend) return;
    setAnswers((a) => [...a, draft.trim()]);
    setDraft("");
    setThinking(true);
    window.setTimeout(() => setThinking(false), 450);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-divider p-4">
      <div className="flex items-center gap-2 border-b border-divider pb-3">
        <AssistantAvatar />
        <div className="min-w-0">
          <p className="font-bold text-ink">Claim assistant</p>
          <p className="text-sm text-muted-ink">{data?.usedAi ? "Questions written by Gemini for this item" : "Checks your claim before the finder sees it"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3" aria-live="polite">
        <BotBubble>
          Hi {firstName}! Before your claim goes to the finder, I'll ask 3 quick questions only the real owner would know.
          {previouslyRejected ? " Your last claim wasn't approved, so give as much detail as you can." : null}
        </BotBubble>
        {questions.map((q, i) =>
          i <= answers.length && (i < answers.length || ready) ? (
            <div key={q} className="flex flex-col gap-3">
              <BotBubble>{q}</BotBubble>
              {answers[i] ? <UserBubble>{answers[i]}</UserBubble> : null}
            </div>
          ) : null,
        )}
        {!ready ? <Typing /> : null}
        {done ? <BotBubble>Thanks! I'll send your answers to the finder. They'll check them against the item and decide.</BotBubble> : null}
        <div ref={endRef} />
      </div>

      {done ? (
        <div className="flex flex-col gap-2 pt-1">
          <Btn
            type="button"
            disabled={submitting}
            onClick={() => onSubmit(formatClaimProof(questions.map((q, i) => ({ q, a: answers[i] ?? "" }))))}
          >
            {submitting ? "Sending…" : "Send claim to finder"}
          </Btn>
          <button
            type="button"
            onClick={() => setAnswers([])}
            className="mx-auto min-h-11 rounded px-3 text-[15px] font-bold text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link"
          >
            Change my answers
          </button>
        </div>
      ) : (
        <form
          className="flex items-end gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="claim-answer" className="sr-only">Your answer</label>
          <textarea
            id="claim-answer"
            ref={inputRef}
            rows={2}
            maxLength={MAX_ANSWER}
            value={draft}
            disabled={!ready}
            placeholder={ready ? "Type your answer…" : "Waiting for the next question…"}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="min-h-[52px] flex-1 resize-none rounded-xl border border-line bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted-ink/70 focus:border-link focus:outline-none focus:ring-[3px] focus:ring-link/30 disabled:bg-surface"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send answer"
            className={cn(
              "grid size-[52px] shrink-0 place-items-center rounded-xl bg-brand text-white transition-opacity",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-link/50 disabled:opacity-40",
            )}
          >
            <IconArrowUp size={22} stroke={2.5} />
          </button>
        </form>
      )}
    </div>
  );
}

export function ClaimChat(props: React.ComponentProps<typeof Conversation>) {
  const [open, setOpen] = useState(false);
  if (open) return <Conversation {...props} />;
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <div className="flex items-start gap-3">
        <AssistantAvatar />
        <div>
          <p className="text-lg font-bold text-ink">Is this yours?</p>
          <p className="text-[15px] text-muted-ink">Our claim assistant will ask 3 quick questions, then send your answers to the finder.</p>
        </div>
      </div>
      <Btn type="button" onClick={() => setOpen(true)}>Yes, it's mine</Btn>
    </div>
  );
}
