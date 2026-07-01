import { UpdatePasswordForm } from "@/components/update-password-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateUser = vi.fn();
const getSession = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getSession, updateUser },
  }),
}));

beforeEach(() => {
  updateUser.mockReset();
  getSession.mockReset();
  // Simulate the recovery session established by /auth/confirm.
  getSession.mockResolvedValue({ data: { session: { user: { id: "u1" } } } });
  updateUser.mockResolvedValue({ error: null });
});

describe("UpdatePasswordForm", () => {
  it("shows both password fields once a recovery session is present", async () => {
    render(<UpdatePasswordForm />);
    expect(await screen.findByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
  });

  it("blocks submission and reports mismatched passwords", async () => {
    render(<UpdatePasswordForm />);
    const pw = await screen.findByLabelText("New password");
    const confirm = screen.getByLabelText("Confirm new password");
    fireEvent.change(pw, { target: { value: "correcthorse" } });
    fireEvent.change(confirm, { target: { value: "batterystaple" } });
    fireEvent.click(screen.getByRole("button", { name: /save new password/i }));

    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("calls updateUser with a valid matching password", async () => {
    render(<UpdatePasswordForm />);
    const pw = await screen.findByLabelText("New password");
    const confirm = screen.getByLabelText("Confirm new password");
    fireEvent.change(pw, { target: { value: "correcthorse" } });
    fireEvent.change(confirm, { target: { value: "correcthorse" } });
    fireEvent.click(screen.getByRole("button", { name: /save new password/i }));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({ password: "correcthorse" }),
    );
  });

  it("shows a recovery-expired message when no session is present", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    render(<UpdatePasswordForm />);
    expect(
      await screen.findByText(/reset link is invalid or has expired/i),
    ).toBeInTheDocument();
  });
});
