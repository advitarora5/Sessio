import { describe, expect, it } from "vitest";
import { deltaToneClass, trendFromValue } from "@/lib/utils/delta";

describe("trendFromValue", () => {
  it("maps positive/negative/zero to up/down/flat", () => {
    expect(trendFromValue(5)).toBe("up");
    expect(trendFromValue(-5)).toBe("down");
    expect(trendFromValue(0)).toBe("flat");
  });

  it("inverts meaning when lower is better", () => {
    expect(trendFromValue(5, true)).toBe("down");
    expect(trendFromValue(-5, true)).toBe("up");
  });
});

describe("deltaToneClass", () => {
  it("uses green for up, red for down, gray for flat", () => {
    expect(deltaToneClass("up")).toBe("text-green-600");
    expect(deltaToneClass("down")).toBe("text-red-600");
    expect(deltaToneClass("flat")).toBe("text-gray-500");
  });
});
