"use client";

import { Info } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { TeamLanyardRail } from "@/components/ui/team-lanyard-rail";
import { MEMBERS } from "./members";

const ITEMS = MEMBERS.map((name, i) => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, "-"),
  name,
  role: "BSIT-3A",
  tone: /** @type {1|2|3|4|5} */ ((i % 5) + 1),
}));

/** About page in the workspace: what ADVSTAT is, then the class that built it. */
export function AboutContent() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="About"
        icon={Info}
        title="About ADVSTAT"
        description="A statistics workstation for simple linear regression and Z-tests that shows every sum, formula and decision rule behind the answer. Results are checked against SciPy and statsmodels. Built by BSIT-3A."
      />

      <div className="panel overflow-hidden rounded-2xl border bg-card dark:border-white/10 dark:bg-zinc-950/60">
        <TeamLanyardRail
          items={ITEMS}
          eyebrow="The team"
          heading="BSIT-3A"
          caption={`${MEMBERS.length} members. Scroll or drag sideways, then tap a badge to flip it.`}
          scroll
          className="bg-transparent"
        />
      </div>

      <section aria-labelledby="members-title">
        <h2 id="members-title" className="text-lg font-semibold tracking-tight">
          Members
        </h2>
        <ol className="mt-3 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERS.map((name, i) => (
            <li key={name} className="flex items-baseline gap-3 border-b py-2.5 text-[15px]">
              <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              {name}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
