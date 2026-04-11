
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { initFrontendSentry } from "./app/lib/sentry.ts";
  import "./styles/index.css";

  initFrontendSentry();

  createRoot(document.getElementById("root")!).render(<App />);
  
