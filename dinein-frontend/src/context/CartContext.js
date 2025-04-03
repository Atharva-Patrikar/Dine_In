import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (dish) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === dish.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dish) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart }}> {/* ✅ Added setCart */}
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
