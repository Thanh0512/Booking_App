import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/userApi";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  return (
    <div className="navbar">
      <div className="navContainer">
        <Link to="/" className="logo">
          <span >Booking App</span>
        </Link>

        <div className="navItems">
          {!user ? (
            <>
              <Link to="/register">
                <button className="navButton">Register</button>
              </Link>
              <Link to="/login">
                <button className="navButton">Login</button>
              </Link>
            </>
          ) : (
            <>
              <span className="navUsername"> {user.email}</span>
              <Link to="/transactions">
                <button className="navButton">Transactions</button>
              </Link>
              <button className="navButton" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
