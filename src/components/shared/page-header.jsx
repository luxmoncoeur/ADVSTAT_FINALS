"use client";

import { Badge } from "@/components/ui/badge";

/**
 * @param {{ eyebrow?: string, icon?: import('react').ElementType, title: string, description: string, actions?: import('react').ReactNode }} props
 */
export function PageHeader({ eyebrow, icon: Icon, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-1.5">
        {eyebrow ? (
          <Badge variant="outline" className="gap-1.5 rounded-md px-2 py-0.5 text-xs font-normal">
            {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
            {eyebrow}
          </Badge>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
