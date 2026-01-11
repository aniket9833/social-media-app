import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SearchUsers from "./SearchUsers";
import { BookmarkIcon } from "@heroicons/react/outline";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Social Media
          </Link>

          {user && <SearchUsers />}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/feed" className="text-gray-700 hover:text-blue-600">
                  Feed
                </Link>
                <Link
                  to="/explore"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Explore
                </Link>
                <Link
                  to="/bookmarks"
                  className="text-gray-700 hover:text-blue-600 flex items-center space-x-1"
                >
                  <BookmarkIcon className="w-5 h-5" />
                  <span>Bookmarks</span>
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
