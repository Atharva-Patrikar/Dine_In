import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="w-full p-4">
      <input
        type="text"
        placeholder="Search dishes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
      />
    </div>
  );
};

export default SearchBar;
