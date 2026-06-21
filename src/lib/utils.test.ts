import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, debounce } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const showHidden = false;
    expect(cn("base", showHidden && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles null and undefined", () => {
    expect(cn("foo", null, undefined, "bar")).toBe("foo bar");
  });

  it("handles object syntax", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delays execution", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cancels previous pending call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes arguments to the original function", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a", 1);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("a", 1);
  });

  it("does not call if cancelled", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("works with multiple independent debounced calls when delay passes", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("first");

    debounced("second");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("second");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
