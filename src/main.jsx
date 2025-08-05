import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ApiPostDisplay from "./app.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApiPostDisplay />
  </StrictMode>
);
