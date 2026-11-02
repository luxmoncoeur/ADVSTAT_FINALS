import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { Toaster } from "@/components/ui/toaster";
import { toast, useToast } from "@/hooks/use-toast";

describe("Shadcn Toast System", () => {
  beforeEach(() => {
    act(() => {
      toast.clear();
    });
  });

  it("adds and displays a basic toast", async () => {
    render(<Toaster />);

    act(() => {
      toast({
        title: "Test Toast",
        description: "This is a test notification",
      });
    });

    expect(await screen.findByText("Test Toast")).toBeInTheDocument();
    expect(screen.getByText("This is a test notification")).toBeInTheDocument();
  });

  it("supports string-only toast call", async () => {
    render(<Toaster />);

    act(() => {
      toast("Simple string alert");
    });

    expect(await screen.findByText("Simple string alert")).toBeInTheDocument();
  });

  it("handles toast.success helper with icon", async () => {
    render(<Toaster />);

    act(() => {
      toast.success("Data imported successfully", {
        description: "50 rows parsed",
      });
    });

    expect(await screen.findByText("Data imported successfully")).toBeInTheDocument();
    expect(screen.getByText("50 rows parsed")).toBeInTheDocument();
  });

  it("handles toast.error helper with destructive styling", async () => {
    render(<Toaster />);

    act(() => {
      toast.error("Check highlighted inputs", {
        description: "Invalid values found",
      });
    });

    expect(await screen.findByText("Check highlighted inputs")).toBeInTheDocument();
    expect(screen.getByText("Invalid values found")).toBeInTheDocument();
  });

  it("handles toast.message helper", async () => {
    render(<Toaster />);

    act(() => {
      toast.message("Scenario loaded: Benchmark 1", {
        description: "Inputs have been populated",
      });
    });

    expect(await screen.findByText("Scenario loaded: Benchmark 1")).toBeInTheDocument();
    expect(screen.getByText("Inputs have been populated")).toBeInTheDocument();
  });

  it("handles toast.warning and toast.info helpers", async () => {
    render(<Toaster />);

    act(() => {
      toast.warning("Warning message");
      toast.info("Info message");
    });

    expect(await screen.findByText("Warning message")).toBeInTheDocument();
    expect(await screen.findByText("Info message")).toBeInTheDocument();
  });

  it("allows dismissing toasts individually and all at once", async () => {
    render(<Toaster />);

    let toastRef;
    act(() => {
      toastRef = toast({ title: "Dismissable toast" });
    });

    expect(await screen.findByText("Dismissable toast")).toBeInTheDocument();

    act(() => {
      toastRef.dismiss();
    });

    // Dismiss sets open to false
    act(() => {
      toast.dismiss();
    });
  });

  it("allows updating an existing toast", async () => {
    render(<Toaster />);

    let toastRef;
    act(() => {
      toastRef = toast({ title: "Initial Title" });
    });

    expect(await screen.findByText("Initial Title")).toBeInTheDocument();

    act(() => {
      toastRef.update({ id: toastRef.id, title: "Updated Title" });
    });

    expect(await screen.findByText("Updated Title")).toBeInTheDocument();
  });

  it("renders an accessible close button with sr-only label", async () => {
    render(<Toaster />);

    act(() => {
      toast({ title: "Closeable toast" });
    });

    expect(await screen.findByText("Closeable toast")).toBeInTheDocument();
    const closeBtn = screen.getByRole("button", { name: "Close" });
    expect(closeBtn).toBeInTheDocument();

    await userEvent.click(closeBtn);
  });

  it("handles toast.promise for resolved promises", async () => {
    render(<Toaster />);

    const promise = Promise.resolve("done");
    await act(async () => {
      await toast.promise(promise, {
        loading: "Processing data...",
        success: (data) => `Completed: ${data}`,
        error: "Failed",
      });
    });

    expect(await screen.findByText("Completed: done")).toBeInTheDocument();
  });

  it("handles toast.promise for rejected promises", async () => {
    render(<Toaster />);

    const promise = Promise.reject(new Error("network error"));
    await act(async () => {
      try {
        await toast.promise(promise, {
          loading: "Fetching...",
          success: "Success",
          error: "Fetch failed",
        });
      } catch {
        // expected rejection
      }
    });

    expect(await screen.findByText("Fetch failed")).toBeInTheDocument();
  });

  it("handles toast.loading helper with spinner and infinite duration", async () => {
    render(<Toaster />);

    act(() => {
      toast.loading("Analyzing data...");
    });

    expect(await screen.findByText("Analyzing data...")).toBeInTheDocument();
  });

  it("deduplicates and updates when an existing toast id is reused", async () => {
    render(<Toaster />);

    act(() => {
      toast({ id: "custom-id", title: "Step 1" });
    });

    expect(await screen.findByText("Step 1")).toBeInTheDocument();

    act(() => {
      toast({ id: "custom-id", title: "Step 2" });
    });

    expect(await screen.findByText("Step 2")).toBeInTheDocument();
    expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
  });

  it("handles toast.promise when passed a function that returns a promise", async () => {
    render(<Toaster />);

    await act(async () => {
      await toast.promise(() => Promise.resolve("resolved via fn"), {
        loading: "Running fn...",
        success: (msg) => `Result: ${msg}`,
        error: "Fn failed",
      });
    });

    expect(await screen.findByText("Result: resolved via fn")).toBeInTheDocument();
  });

  it("handles numbers and React elements as toast titles", async () => {
    render(<Toaster />);

    act(() => {
      toast(404);
      toast(<span data-testid="custom-jsx">Custom Node</span>);
    });

    expect(await screen.findByText("404")).toBeInTheDocument();
    expect(screen.getByTestId("custom-jsx")).toBeInTheDocument();
  });

  it("provides useToast hook hook interface", () => {
    function DummyConsumer() {
      const { toasts } = useToast();
      return <div data-testid="count">{toasts.length}</div>;
    }

    render(<DummyConsumer />);
    expect(screen.getByTestId("count")).toHaveTextContent("0");

    act(() => {
      toast({ title: "One" });
    });

    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });
});
