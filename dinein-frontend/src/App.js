import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import DineIn from "./pages/DineIn";
import CategoryPage from "./pages/CategoryPage";
import "./index.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dinein" />} />
          <Route path="/dinein" element={<DineIn />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
