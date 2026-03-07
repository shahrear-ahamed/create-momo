import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
function App() {
  return (
    <div>
      <h1>Welcome to {`{{projectName}}`} 🚀</h1>
      <p>Powered by React + Vite</p>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
