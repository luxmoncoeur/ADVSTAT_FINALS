import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

test("renders a shadcn button", () => {
  render(<Button>Compute</Button>);
  expect(screen.getByRole("button", { name: "Compute" })).toBeInTheDocument();
});
