import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH, validateNewPassword } from "@/lib/utils/password-validation";

describe("validateNewPassword", () => {
  it("rejects passwords shorter than the minimum length", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    expect(validateNewPassword(short, short)).toMatch(/at least/i);
  });

  it("rejects an empty password", () => {
    expect(validateNewPassword("", "")).toMatch(/at least/i);
  });

  it("rejects mismatched passwords", () => {
    expect(
      validateNewPassword("correcthorse", "batterystaple"),
    ).toBe("Passwords do not match.");
  });

  it("accepts a valid, matching password", () => {
    const pw = "correcthorse";
    expect(validateNewPassword(pw, pw)).toBeNull();
  });
});
