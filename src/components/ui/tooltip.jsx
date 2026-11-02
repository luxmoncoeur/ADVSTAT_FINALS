"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "cn";

function TooltipProvider({
  delay = 0,
  delayDuration,
  ...props
}) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delayDuration ?? delay}
      {...props}
    />
  );
}

function Tooltip({ ...props }) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ asChild, children, render, ...props }) {
  let finalRender = render;
  let finalChildren = children;
  if (!finalRender && asChild && React.isValidElement(children)) {
    finalRender = children;
    finalChildren = undefined;
  }
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      render={finalRender}
      {...props}
    >
      {finalChildren}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipArrow({ className, ...props }) {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      className={cn(
        "z-50 size-2.5 rotate-45 rounded-[2px] bg-foreground data-[side=bottom]:-top-1 data-[side=inline-end]:-left-1 data-[side=inline-start]:-right-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1",
        className
      )}
      {...props}
    />
  );
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  hidden,
  arrow = true,
  children,
  ...props
}) {
  if (hidden) {
    return null;
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          {arrow ? <TooltipArrow /> : null}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipArrow };
