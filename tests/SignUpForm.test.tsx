import { SignUpForm } from "@/components/sign-up-form";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("SignUpForm role selector readability", () => {
  it("renders the role select on a white surface, not the navy bg-background token", () => {
    const { container } = render(<SignUpForm />);
    const roleSelect = container.querySelector("#role");
    expect(roleSelect).not.toBeNull();
    // Regression guard for the "dark blue, unreadable options" bug: the role
    // select must not use `bg-background` (navy) and must use a light surface.
    expect(roleSelect!.className).not.toContain("bg-background");
    expect(roleSelect!.className).toContain("bg-white");
    expect(roleSelect!.className).toContain("text-card-foreground");
  });
});
