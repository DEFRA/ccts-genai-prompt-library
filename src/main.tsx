import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeStores, areStoresReady } from "./store/initializeStores";

document.documentElement.classList.add("dark-theme");

const initApp = async () => {
  try {
    await initializeStores();

    if (!areStoresReady()) {
      throw new Error("Stores failed to initialize");
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );  } catch (error) {
    console.error("Failed to initialize app:", error);
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; color: red;">
          Failed to initialize application. Please try refreshing the page.
        </div>
      `;
    }
  }
};

initApp();
