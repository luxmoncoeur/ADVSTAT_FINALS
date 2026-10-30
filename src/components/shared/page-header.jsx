"use client";

import BlurText from "@/components/reactbits/BlurText";
import { Badge } from "@/components/ui/badge";

/**
 * @param {{ eyebrow?: string, icon?: import('react').ElementType, title: string, description: string, actions?: import('react').ReactNode }} props
 */
export function PageHeader({ eyebrow, icon: Icon, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <Badge variant="secondary" className="gap-1.5 rounded-full px-2.5 py-0.5">
            {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
            {eyebrow}
          </Badge>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          <span className="sr-only">{title}</span>
          <span aria-hidden="true">
            <BlurText text={title} animateBy="words" delay={90} direction="top" trigger="load" />
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
