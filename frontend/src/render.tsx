import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ReadonlyCanvas from "./components/Canvas/ReadonlyCanvas.tsx";

createRoot(document.getElementById("render-root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/render/:token" element={<ReadonlyCanvas />} />
    </Routes>
  </BrowserRouter>
);
