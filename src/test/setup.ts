import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
  convertFileSrc: vi.fn((path: string) => path),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    setMinSize: vi.fn(),
    setMaxSize: vi.fn(),
    setSize: vi.fn(),
    setPosition: vi.fn(),
    setAlwaysOnTop: vi.fn(),
    isMaximized: vi.fn(() => Promise.resolve(false)),
    innerSize: vi.fn(() => Promise.resolve({ toLogical: () => ({ width: 1280, height: 720 }) })),
    outerPosition: vi.fn(() => Promise.resolve({ x: 0, y: 0 })),
    scaleFactor: vi.fn(() => Promise.resolve(1)),
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    close: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    onCloseRequested: vi.fn(() => Promise.resolve(() => {})),
  })),
  LogicalSize: vi.fn((width: number, height: number) => ({ width, height })),
  PhysicalPosition: vi.fn((x: number, y: number) => ({ x, y })),
  currentMonitor: vi.fn(() =>
    Promise.resolve({
      size: { width: 1920, height: 1080 },
    })
  ),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      save: vi.fn(),
      keys: vi.fn(() => Promise.resolve([])),
      entries: vi.fn(() => Promise.resolve([])),
    })
  ),
  Store: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    save: vi.fn(),
    keys: vi.fn(() => Promise.resolve([])),
    entries: vi.fn(() => Promise.resolve([])),
  })),
}));

vi.mock("@tauri-apps/plugin-log", () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  attachConsole: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
    loading: vi.fn(),
    custom: vi.fn(),
    message: vi.fn(),
  }),
  Toaster: vi.fn(() => null),
}));
