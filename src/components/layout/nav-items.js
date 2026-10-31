import { BookOpenText, ChartScatter, FlaskConical, LayoutDashboard } from "lucide-react";

export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard, description: "Start here" }],
  },
  {
    label: "Analyses",
    items: [
      {
        title: "Linear Regression",
        href: "/regression",
        icon: ChartScatter,
        description: "Ŷ = a + bX and r",
      },
      {
        title: "Hypothesis Testing",
        href: "/hypothesis",
        icon: FlaskConical,
        description: "Z-tests",
      },
    ],
  },
  {
    label: "Learn",
    items: [
      { title: "Formulas & Z-Table", href: "/learn", icon: BookOpenText, description: "Reference" },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);
