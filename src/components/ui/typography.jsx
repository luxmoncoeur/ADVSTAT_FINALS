import { cn } from "cn";

/**
 * shadcn-style typography primitives. One scale, used everywhere on the landing page:
 * Display (hero) > H2 (section) > H3 (item) > Lead (intro) > P (body) > Muted (meta).
 * Headings are balanced, body copy holds a 60–68ch measure, numerals are tabular.
 */

export function TypographyDisplay({ className, ...props }) {
  return (
    <h1
      className={cn(
        "font-heading text-[2.5rem] leading-[1.04] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-5xl lg:text-[3.5rem]",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH2({ className, ...props }) {
  return (
    <h2
      className={cn(
        "scroll-m-24 font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.028em] text-balance text-foreground sm:text-4xl",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH3({ className, ...props }) {
  return (
    <h3
      className={cn(
        "scroll-m-24 font-heading text-lg leading-snug font-semibold tracking-[-0.015em] text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyLead({ className, ...props }) {
  return (
    <p
      className={cn(
        "max-w-[58ch] text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyP({ className, ...props }) {
  return (
    <p
      className={cn("max-w-[64ch] leading-7 text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TypographyMuted({ className, ...props }) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

/** Inline formula or value: code, data and measurement are what monospace is for. */
export function TypographyInlineCode({ className, ...props }) {
  return (
    <code
      className={cn(
        "rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.875em] font-medium text-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function TypographyBlockquote({ className, ...props }) {
  return (
    <blockquote
      className={cn(
        "max-w-[58ch] font-heading text-xl leading-snug tracking-[-0.01em] text-pretty text-foreground sm:text-2xl",
        className,
      )}
      {...props}
    />
  );
}
