import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, XIcon } from "@heroicons/react/outline";
import api from "../../services/api";
import toast from "react-hot-toast";

const SearchUsers = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debounceSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchQuery) => {
        clearTimeout(timeoutId);

        if (!searchQuery.trim()) {
          setResults([]);
          setShowResults(false);
          return;
        }

        setLoading(true);
        timeoutId = setTimeout(async () => {
          try {
            const response = await api.users.search(searchQuery);
            setResults(response.data.users || []);
            setShowResults(true);
          } catch {
            toast.error("Failed to search users");
            setResults([]);
          } finally {
            setLoading(false);
          }
        }, 300); // 300ms debounce delay
      };
    })(),
    []
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debounceSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search users..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user.username}`}
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setShowResults(false);
                  }}
                  className="flex items-center p-3 hover:bg-gray-50 transition"
                >
                  <img
                    src={
                      user.profilePicture ||
                      "https://img.icons8.com/ios-filled/50/737373/user-male-circle.png"
                    }
                    alt={user.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500">{user.fullName}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
