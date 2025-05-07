
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap
import "./mainHeader.css";


function Navbar() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logout successfully");
      navigate("/login"); // Redirect after logout
    } catch (error) {
      setError("Failed to log out. Please try again."); // Show error on page
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            data-bs-toggle="collapse"
            data-bs-target="#navbarm"
            aria-controls="navbarm"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-md-center" id="navbarm">
            <ul className="navbar-nav">
              <li className="nav-item mx-2">
                <Link className="nav-link text-white" to="/home">
                  Home
                </Link>
              </li>
              {!user ? (
                <>

                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/signup">
                      Signup
                    </Link>
                  </li>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/login">
                      Login
                    </Link>
                  </li>
                </>
              ) :
                <>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item mx-2">
                    <Link className="nav-link text-white" to="/Notification">
                      Notifications
                    </Link>
                  </li>
                  <li className="nav-item mx-0 ">
                    <button onClick={handleLogout} className="btn text-white fs-5">
                      Logout
                    </button>
                  </li>
                </>

              }
              <li className="nav-item mx-2">
                <Link className="nav-link text-white" to="/aboutfresht">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Show error message if logout fails */}
      {error && (
        <div className="alert alert-danger text-center mt-2">{error}</div>
      )}
    </div>
  );
}

export default Navbar;
