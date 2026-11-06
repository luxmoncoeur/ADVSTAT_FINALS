import Image from "next/image";

/** AnalytIQ Studio logo: data points and a fitted regression line inside a rounded tile. */
export function BrandMark({ className = "size-8" }) {
  return (
    <span className={`relative block shrink-0 ${className}`} aria-hidden="true">
      <Image
        src="/brand/stats-logo-128.png"
        alt=""
        fill
        sizes="64px"
        unoptimized
        priority
        draggable={false}
        className="select-none"
      />
    </span>
  );
}
