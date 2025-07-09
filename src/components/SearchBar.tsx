import React from "react";
import { Search, X } from "lucide-react";
import { useStore } from "../store/useStore";

export const SearchBar: React.FC = () => {
  const { searchTerm, setSearchTerm } = useStore((state) => ({
    searchTerm: state.searchTerm,
    setSearchTerm: state.setSearchTerm,
  }));

  return (
    <div className="animate-fade-in">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search templates..."
          className="block w-full pl-10 pr-10 py-2 border dark:border-dark-border rounded-lg 
                   bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 
                   transition-all duration-200"
        />        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-2 flex items-center"
            data-testid="clear-search-button"
          >
            <X className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
          </button>
        )}
      </div>
    </div>
  );
};
