import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDominantColor } from "./color-utils";

function createMockImage() {
  const mockContext = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: [100, 150, 200, 255] })),
  };

  let onloadHandler: (() => void) | null = null;
  let onerrorHandler: (() => void) | null = null;

  const mockImage = {
    set crossOrigin(_val: string) {},
    set src(_val: string) {
      setTimeout(() => onloadHandler?.(), 0);
    },
    get onload() {
      return onloadHandler;
    },
    set onload(handler) {
      onloadHandler = handler;
    },
    get onerror() {
      return onerrorHandler;
    },
    set onerror(handler) {
      onerrorHandler = handler;
    },
  };

  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "canvas") {
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      } as unknown as HTMLCanvasElement;
    }
    if (tagName === "img") {
      return mockImage as unknown as HTMLImageElement;
    }
    return document.createElement(tagName);
  });

  return { mockContext, mockImage };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getDominantColor", () => {
  it("extracts color from image and returns rgb string", async () => {
    createMockImage();
    const color = await getDominantColor("test.jpg");
    expect(color).toBe("rgb(100, 150, 200)");
  });

  it("returns cached result on repeated calls", async () => {
    createMockImage();
    const first = await getDominantColor("test.jpg");
    const second = await getDominantColor("test.jpg");
    expect(first).toBe(second);
  });

  it("falls back to #000000 on canvas error", async () => {
    const { mockContext } = createMockImage();
    mockContext.getImageData = vi.fn(() => {
      throw new Error("CORS error");
    });
    const color = await getDominantColor("canvas-error.jpg");
    expect(color).toBe("#000000");
  });

  it("falls back to #000000 when canvas context is null", async () => {
    createMockImage();
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => null),
        } as unknown as HTMLCanvasElement;
      }
      if (tagName === "img") {
        return {
          set crossOrigin(_val: string) {},
          set src(_val: string) {
            setTimeout(() => {
              const img = this as unknown as HTMLImageElement;
              if (img.onload) (img.onload as () => void)();
            }, 0);
          },
        } as unknown as HTMLImageElement;
      }
      return document.createElement(tagName);
    });
    const color = await getDominantColor("null-context.jpg");
    expect(color).toBe("#000000");
  });

  it("falls back to #000000 on image load error", async () => {
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({})),
        } as unknown as HTMLCanvasElement;
      }
      if (tagName === "img") {
        return {
          set crossOrigin(_val: string) {},
          set src(_val: string) {
            setTimeout(() => {
              const img = this as unknown as HTMLImageElement;
              if (img.onerror) (img.onerror as () => void)();
            }, 0);
          },
        } as unknown as HTMLImageElement;
      }
      return document.createElement(tagName);
    });
    const color = await getDominantColor("bad-image.jpg");
    expect(color).toBe("#000000");
  });
});
