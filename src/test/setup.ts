import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Polyfill ResizeObserver for Radix UI components in jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
  convertFileSrc: vi.fn((path: string) => path),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
  emit: vi.fn(() => Promise.resolve()),
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: vi.fn(() => ({
    label: "main",
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
    close: vi.fn(() => Promise.resolve()),
    show: vi.fn(() => Promise.resolve()),
    hide: vi.fn(() => Promise.resolve()),
    onCloseRequested: vi.fn(() => Promise.resolve(() => {})),
  })),
  currentMonitor: vi.fn(() =>
    Promise.resolve({
      size: { width: 1920, height: 1080 },
    })
  ),
}));

const mockMiniplayerWindow = {
  once: vi.fn(),
  show: vi.fn(() => Promise.resolve()),
  setFocus: vi.fn(() => Promise.resolve()),
  hide: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve()),
  setSize: vi.fn(() => Promise.resolve()),
  setPosition: vi.fn(() => Promise.resolve()),
};

vi.mock("@tauri-apps/api/webviewWindow", () => ({
  WebviewWindow: Object.assign(
    vi.fn(() => mockMiniplayerWindow),
    { getByLabel: vi.fn(() => Promise.resolve(mockMiniplayerWindow)) },
  ),
  getCurrentWebviewWindow: vi.fn(() => ({
    label: "main",
  })),
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
