import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

describe("Base UI Tooltip component", () => {
  it("renders trigger with render prop and shows tooltip on hover", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger render={<Button>Hover target</Button>} />
          <TooltipContent>Helpful info text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByRole("button", { name: "Hover target" });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByText("Helpful info text")).not.toBeInTheDocument();

    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText("Helpful info text")).toBeInTheDocument();
    });

    await user.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByText("Helpful info text")).not.toBeInTheDocument();
    });
  });

  it("shows tooltip on keyboard focus and dismisses on blur", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                tabIndex={0}
                aria-label="Statistical symbol x̄"
              >
                x̄
              </span>
            }
          />
          <TooltipContent>Sample mean description</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByLabelText("Statistical symbol x̄");
    expect(trigger).toBeInTheDocument();

    await user.tab();
    expect(trigger).toHaveFocus();

    await waitFor(() => {
      expect(screen.getByText("Sample mean description")).toBeInTheDocument();
    });

    await user.tab();
    expect(trigger).not.toHaveFocus();

    await waitFor(() => {
      expect(screen.queryByText("Sample mean description")).not.toBeInTheDocument();
    });
  });

  it("supports side and sideOffset positioning props", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger render={<Button>Positioned</Button>} />
          <TooltipContent side="right" sideOffset={8} className="custom-popup">
            Positioned tooltip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByRole("button", { name: "Positioned" });
    await user.hover(trigger);

    const content = await screen.findByText("Positioned tooltip");
    expect(content).toBeInTheDocument();
    expect(content.closest("[data-slot='tooltip-content']")).toHaveClass("custom-popup");
  });

  it("works seamlessly with Radix DropdownMenuTrigger without breaking menu interactions", async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();

    render(
      <TooltipProvider delay={0}>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Change color theme">
                    Toggle
                  </Button>
                </DropdownMenuTrigger>
              }
            />
            <TooltipContent>Theme preference</TooltipContent>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="light" onValueChange={setTheme}>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    );

    const button = screen.getByRole("button", { name: "Change color theme" });
    expect(button).toBeInTheDocument();

    // Hover triggers tooltip
    await user.hover(button);
    await waitFor(() => {
      expect(screen.getByText("Theme preference")).toBeInTheDocument();
    });

    // Clicking button opens dropdown menu
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByRole("menuitemradio", { name: "Dark" })).toBeInTheDocument();
    });

    // Selecting dropdown menu option executes callback
    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("renders trigger with render prop and children content correctly", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger render={<Button />}>Button label from children</TooltipTrigger>
          <TooltipContent>Tooltip for button with children</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByRole("button", { name: "Button label from children" });
    expect(trigger).toBeInTheDocument();

    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getByText("Tooltip for button with children")).toBeInTheDocument();
    });
  });

  it("suppresses tooltip content when hidden prop is true", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger render={<Button>Trigger with hidden popup</Button>} />
          <TooltipContent hidden={true}>Should never appear</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByRole("button", { name: "Trigger with hidden popup" });
    await user.hover(trigger);

    expect(screen.queryByText("Should never appear")).not.toBeInTheDocument();
  });

  it("supports backward-compatible asChild and delayDuration props", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Legacy child button</button>
          </TooltipTrigger>
          <TooltipContent>Legacy compatibility text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const trigger = screen.getByRole("button", { name: "Legacy child button" });
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText("Legacy compatibility text")).toBeInTheDocument();
    });
  });
});
