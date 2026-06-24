import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import MiniPlayerApp from "./components/miniplayer-app";
import { ErrorBoundary } from "./components/error-boundary";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

const params = new URLSearchParams(window.location.search);
const isMiniplayerMode = params.get("mode") === "miniplayer";

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      {isMiniplayerMode ? <MiniPlayerApp /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
