"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ShinyText from "@/components/reactbits/ShinyText";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { THEME_HEX } from "@/lib/theme-colors";
import { BrandMark } from "./brand-mark";
import { NAV_GROUPS } from "./nav-items";

export function AppSidebar() {
  const pathname = usePathname();
  const theme = useResolvedTheme();
  const { setOpenMobile } = useSidebar();
  const colors = THEME_HEX[theme];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="ADVSTAT home">
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <BrandMark />
                <span className="grid leading-tight">
                  <ShinyText
                    text="ADVSTAT"
                    color={colors.foreground}
                    shineColor={colors.primary}
                    speed={3}
                    delay={2}
                    className="text-base font-semibold tracking-tight"
                  />
                  <span className="text-xs text-muted-foreground">Statistics Lab</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpenMobile(false)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-xs group-data-[collapsible=icon]:hidden">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accept" aria-hidden="true" />
          <p className="leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Verified accuracy.</span> Every formula is
            tested against SciPy and statsmodels reference values.
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
