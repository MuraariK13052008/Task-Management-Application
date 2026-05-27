import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#231f1c",
            color: "#f5f0eb",
            border: "1px solid #3d3530",
            fontFamily: "Outfit, sans-serif",
            fontSize: "13px",
          },
          success: {
            iconTheme: { primary: "#f59e0b", secondary: "#231f1c" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#231f1c" },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
