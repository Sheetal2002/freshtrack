
import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase/firebase";
import { db, messaging } from "../firebase/firebase"; // assuming messaging is exported from firebase.js
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import WelMsg from "./Images/wel_msg2.png";

import ResetForm from "./ResetForm";
import './style.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false); // State for forgot password form visibility
  const navigate = useNavigate();

  // Redirect already logged-in users
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !loading) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate, loading]);  // Ensure it respects the loading state



  // Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Redirect on successful login
    } catch (error) {
      setError("Invalid credentials or user not found.");
    }
  };


  // Google Login
  const handleGoogleLogin1 = async () => {
    // try {
    //   await signInWithPopup(auth, googleProvider);
    //   navigate("/dashboard"); // Redirect to dashboard
    // } catch (error) {
    //   setError(error.message || "Google Login Failed.");
  }
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Request Notification Permission
      // let fcmToken = null;
      // const permission = await Notification.requestPermission();
      // if (permission === "granted") {
      //   fcmToken = await getToken(messaging, { vapidKey: "YOUR_PUBLIC_VAPID_KEY" });
      //   console.log("FCM Token:", fcmToken);
      // } else {
      //   console.log("Notification permission not granted.");
      // }

      // Check if user already exists
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        // Save new user data with FCM token
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          // fcmToken: fcmToken || null,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Optional: update FCM token if it changed
        // if (fcmToken) {
        //   await setDoc(userDocRef, { fcmToken }, { merge: true });
        // }
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      if (error?.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with a different sign-in method.");
      } else {
        setError("Google signup failed. Please try again.");
      }
    }
  };
  // Redirect to Signup if user does not have an account
  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  // Clear Error Messages When Typing
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    setError(""); // Clear error when user types
  };

  return (
    <>
      {showResetForm ? (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
          <ResetForm onClose={() => setShowResetForm(false)} />
        </div>
      ) : (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 ">
          <div className="row shadow-lg rounded-4 overflow-hidden log-sign-cont">

            <div className="col-md-6 d-none d-md-block p-0">
              <img
                src={WelMsg}
                alt="Login"
                className="img-fluid h-100"
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Right Side - Login Form */}
            <div className="col-md-6 p-4 ">
              <div className="card p-4 shadow-lg  inner-cont">
                <h2 className="text-center mb-4">Login</h2>
                {error && <p className="alert alert-danger text-center">{error}</p>}
                <form onSubmit={handleEmailLogin}>
                  <div className="mb-3 position-relative">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => handleInputChange(e, setEmail)}
                      required
                    />
                    <FaEnvelope className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted" />
                  </div>
                  <div className="mb-3 position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => handleInputChange(e, setPassword)}
                      required
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-2 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <div className="d-flex justify-content-center">
                    <button className="btn submit-btn w-50 mt-2" type="submit">Login</button>
                  </div>
                </form>
                <div className="text-center mt-3">
                  <p className="text-muted">or continue with</p>
                  <div className="d-flex justify-content-center">
                    <button className="btn w-50 google-btn" onClick={handleGoogleLogin}>
                      <FcGoogle className="me-2" /> Google
                    </button>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <p className="mb-1">Don't have an account?</p>
                  <button className="btn btn-link fs-4 text-light" onClick={handleSignupRedirect}>Sign Up</button>
                  <br />
                  <button className="btn btn-link text-danger fs-4" onClick={() => setShowResetForm(true)}>
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );


};

export default Login;


