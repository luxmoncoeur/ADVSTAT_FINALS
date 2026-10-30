/** ADVSTAT logo: a bell curve with a shaded tail inside a rounded tile. */
export function BrandMark({ className = "size-8" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_6px_20px_-6px_var(--primary)] ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none">
        <path
          d="M2 19h20M3 18.5c3.2 0 4.4-12.5 9-12.5s5.8 12.5 9 12.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M17.2 13.2c1.1 3 2.2 5.3 3.8 5.3h-3.8z" fill="currentColor" opacity="0.55" />
      </svg>
    </span>
  );
}
