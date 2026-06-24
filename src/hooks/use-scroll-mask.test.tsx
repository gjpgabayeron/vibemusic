import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { useScrollMask } from "./use-scroll-mask";
import { useEffect, useRef } from "react";

afterEach(() => {
  vi.restoreAllMocks();
});

function TestComponent({ threshold }: { threshold?: number }) {
  const ref = useScrollMask(threshold);
  return <div ref={ref} data-testid="scroll-container" />;
}

function ScrollTestComponent({ threshold, scrollTopValue }: { threshold?: number; scrollTopValue: number }) {
  const ref = useScrollMask(threshold);
  const hasSetScroll = useRef(false);

  useEffect(() => {
    if (ref.current && !hasSetScroll.current) {
      hasSetScroll.current = true;
      Object.defineProperty(ref.current, "scrollTop", {
        value: scrollTopValue,
        configurable: true,
      });
      ref.current.dispatchEvent(new Event("scroll"));
    }
  });

  return <div ref={ref} data-testid="scroll-container" />;
}

describe("useScrollMask", () => {
  it("sets initial --scroll-mask-top to 1 when scrollTop is 0", () => {
    const { getByTestId } = render(<TestComponent threshold={100} />);
    const el = getByTestId("scroll-container");
    expect(el.style.getPropertyValue("--scroll-mask-top")).toBe("1");
  });

  it("updates --scroll-mask-top on scroll", () => {
    const { getByTestId } = render(<ScrollTestComponent threshold={100} scrollTopValue={50} />);
    const el = getByTestId("scroll-container");
    expect(el.style.getPropertyValue("--scroll-mask-top")).toBe("0.5");
  });

  it("clamps opacity to 0 when scrolled past threshold", () => {
    const { getByTestId } = render(<ScrollTestComponent threshold={100} scrollTopValue={200} />);
    const el = getByTestId("scroll-container");
    expect(el.style.getPropertyValue("--scroll-mask-top")).toBe("0");
  });

  it("uses external ref when provided", () => {
    let capturedRef: React.RefObject<HTMLDivElement | null> | null = null;
    function ExternalRefTest() {
      const externalRef = useRef<HTMLDivElement | null>(null);
      const ref = useScrollMask(24, externalRef);
      capturedRef = ref;
      return <div ref={ref} />;
    }
    render(<ExternalRefTest />);
    expect(capturedRef).not.toBeNull();
    expect(capturedRef!.current).toBeInstanceOf(HTMLDivElement);
  });

  it("defaults threshold to 24", () => {
    const { getByTestId } = render(<TestComponent />);
    const el = getByTestId("scroll-container");
    expect(el.style.getPropertyValue("--scroll-mask-top")).toBe("1");
  });
});
