import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import SearchBar from "../components/SearchBar";
import { FaArrowLeft } from "react-icons/fa";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const { cart, addToCart, removeFromCart } = useCart();
  const [category, setCategory] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table") || "Y?";
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/categories/${categoryId}`)
      .then((response) => response.json())
      .then((data) => setCategory(data))
      .catch((error) => console.error("Error fetching category:", error));

    fetch(`http://localhost:5000/api/categories/${categoryId}/dishes`)
      .then((response) => response.json())
      .then((data) => {
        setDishes(data);
        setFilteredDishes(data);
      })
      .catch((error) => console.error("Error fetching dishes:", error));
  }, [categoryId]);

  useEffect(() => {
    setFilteredDishes(
      searchQuery
        ? dishes.filter((dish) =>
            dish.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : dishes
    );
  }, [searchQuery, dishes]);

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((count, item) => count + item.quantity, 0);

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

  return (
    <div className={`p-4 ${isOrderSummaryOpen ? "overflow-hidden" : ""}`}>
      {/* Smaller Back Button */}
      <button
        className="text-white bg-gray-800 px-3 py-1 rounded-md flex items-center shadow-md text-sm hover:bg-gray-700"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="mr-2 text-xs" /> Back
      </button>

      {/* Table Number (Bold) */}
      <div className="mt-2 text-lg font-bold text-gray-900">{tableNumber}</div>

      {/* Search Bar Above Appetizer Heading */}
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Category Name Styled Like Dine-In Page */}
      <h1 className="text-2xl font-bold text-center mt-4">{category ? category.name : "Loading..."}</h1>

      {/* Dishes (Same Box Size & Styling) */}
      <div className="mt-4">
        {filteredDishes.map((dish) => {
          const cartItem = cart.find((item) => item.id === dish.id);

          return (
            <div key={dish.id} className="flex items-center bg-white rounded-lg shadow-md p-4 mb-4">
              <img
                src={dish.image_url}
                alt={dish.name}
                className="w-24 h-24 object-cover rounded-md"
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />
              <div className="ml-4 flex-grow">
                <h2 className="text-lg font-semibold">{dish.name}</h2>
                <p className="text-green-600 font-bold">₹{dish.price}</p>
              </div>
              {cartItem ? (
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                  <button className="px-2 text-red-500" onClick={() => removeFromCart(dish)}>
                    -
                  </button>
                  <span className="px-4">{cartItem.quantity}</span>
                  <button className="px-2 text-green-500" onClick={() => addToCart(dish)}>
                    +
                  </button>
                </div>
              ) : (
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => addToCart(dish)}>
                  Add +
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 📦 View Order Section */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-yellow-500 text-white p-4 flex justify-between items-center shadow-md">
          <span className="text-sm font-medium">{totalItems} items in cart</span>
          <button className="bg-black px-4 py-2 rounded text-white text-sm flex items-center" onClick={() => setIsOrderSummaryOpen(true)}>
            View Order
          </button>
        </div>
      )}

      {/* Order Summary Modal */}
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
              <div key={item.id} className="flex justify-between p-2 border-b">
                <span>{item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            {/* Total Amount */}
            <div className="text-lg font-bold mt-2">Total: ₹{totalAmount}</div>

            <textarea className="w-full p-2 mt-2 border rounded" placeholder="Enter any additional information about your order."></textarea>

            <button className="mt-3 w-full bg-black text-white py-2 rounded-md" onClick={() => setIsCustomerInfoOpen(true)}>
              Place Order
            </button>
          </div>
        </div>
      )}

      {/* Customer Information Popup */}
      {isCustomerInfoOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">Customer Information</h2>
            <input type="text" placeholder="Enter Name" className="w-full p-2 border rounded mb-3" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <div className="flex items-center">
              <span className="p-2 border rounded-l bg-gray-200">+91</span>
              <input type="text" placeholder="Enter Mobile Number" className="w-full p-2 border rounded-r" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
            </div>
            <button className="mt-3 w-full bg-black text-white py-2 rounded-md" onClick={handleGetOTP}>Get OTP</button>
            <button className="mt-2 w-full text-gray-600" onClick={() => setIsCustomerInfoOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
