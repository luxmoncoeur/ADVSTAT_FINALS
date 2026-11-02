"use client";
import * as React from "react"
import { cn } from "cn"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{
        "--gap": spacing,
      }}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-md data-vertical:flex-col data-vertical:items-stretch",
        spacing === 0 && "gap-0 rounded-md shadow-2xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}) {
  const context = React.useContext(ToggleGroupContext);
  const itemVariant = context.variant || variant;
  const itemSize = context.size || size;
  const spacing = context.spacing;

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={itemVariant}
      data-size={itemSize}
      data-spacing={spacing}
      className={cn(
        toggleVariants({
          variant: itemVariant,
          size: itemSize,
        }),
        spacing === 0 && [
          "rounded-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10",
          itemVariant === "outline" && "[&:not(:first-child)]:-ml-px",
        ],
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:font-semibold data-[state=on]:shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem }
