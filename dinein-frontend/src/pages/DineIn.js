import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { useCart } from "../context/CartContext";

const DineIn = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const { cart, setCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table") || "Y?";
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
        setFilteredCategories(data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    setFilteredCategories(
      searchQuery
        ? categories.filter((category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : categories
    );
  }, [searchQuery, categories]);

  const handleQuantityChange = (item, change) => {
    if (!setCart) {
      console.error("setCart is undefined! Make sure CartContext is correctly implemented.");
      return;
    }

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      setCart(cart.filter((cartItem) => cartItem.id !== item.id));
    } else {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
        )
      );
    }
  };

  const handleGetOTP = async () => {
    if (!customerName || !mobileNumber) {
      alert("Please enter your name and mobile number.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customerName, mobile_number: mobileNumber }),
      });

      if (response.ok) {
        alert("Customer details saved successfully!");
        setCustomerName("");
        setMobileNumber("");
        setIsCustomerInfoOpen(false);
      } else {
        alert("Failed to save customer info.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  // ✅ Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`p-4 ${isOrderSummaryOpen ? "overflow-hidden" : ""}`}>
      <h1 className="text-2xl font-bold text-gray-900 text-center">🍽️ My Restaurant</h1>
      <div className="mt-2 text-lg font-bold text-gray-900">{tableNumber}</div>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <h2 className="text-lg font-bold text-gray-900 mt-4">Categories</h2>

      <div className="grid grid-cols-3 gap-4 mt-2">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-gray-300 rounded-lg shadow-sm p-3 flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            onClick={() => navigate(`/category/${category.id}?table=${tableNumber}`)}
          >
            <img
              src={category.image_url}
              alt={category.name}
              className="w-16 h-16 object-cover rounded-md"
              onError={(e) => (e.target.src = "https://via.placeholder.com/100")}
            />
            <h2 className="text-sm font-medium mt-2 text-gray-800 text-center">{category.name}</h2>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-yellow-500 text-white p-4 flex justify-between items-center shadow-md">
          <span className="text-sm font-medium">{cart.length} items in cart</span>
          <button className="bg-black px-4 py-2 rounded text-white text-sm flex items-center" onClick={() => setIsOrderSummaryOpen(true)}>
            View Order
          </button>
        </div>
      )}

      {isOrderSummaryOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-end">
          <div className="bg-white w-full p-4 shadow-lg border-t rounded-t-lg">
            <div className="flex justify-end mb-2">
              <button className="text-black text-xl font-bold" onClick={() => setIsOrderSummaryOpen(false)}>
                ✖
              </button>
            </div>

            <h2 className="text-lg font-bold mb-2">Your Order Summary</h2>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 border-b">
                <span>{item.name}</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold mr-4">₹{item.price * item.quantity}</span>
                  <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => handleQuantityChange(item, -1)}>-</button>
                  <span className="mx-2">{item.quantity}</span>
                  <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => handleQuantityChange(item, 1)}>+</button>
                </div>
              </div>
            ))}

            {/* ✅ Display total price */}
            <div className="flex justify-between items-center font-bold text-lg mt-4">
              <span>Total Amount:</span>
              <span>₹{totalPrice}</span>
            </div>

            <button className="mt-3 w-full bg-black text-white py-2 rounded-md" onClick={() => setIsCustomerInfoOpen(true)}>
              Place Order
            </button>
          </div>
        </div>
      )}

      {isCustomerInfoOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Customer Information</h2>

            <input
              type="text"
              placeholder="Enter Name"
              className="w-full p-2 border rounded mb-3"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <div className="flex items-center">
              <span className="p-2 border rounded-l bg-gray-200">+91</span>
              <input
                type="text"
                placeholder="Enter Mobile Number"
                className="w-full p-2 border rounded-r"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>

            <button className="mt-3 w-full bg-black text-white py-2 rounded-md" onClick={handleGetOTP}>
              Get OTP
            </button>

            <button className="mt-2 w-full text-gray-600" onClick={() => setIsCustomerInfoOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DineIn;
