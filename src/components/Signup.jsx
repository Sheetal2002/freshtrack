
import React, { useState } from "react";
import { auth, registerWithEmailAndPassword, signInWithGoogle } from "../firebase/firebase";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import './style.css';
import "animate.css";
import WelMsg from "./Images/wel_msg2.png";
// import Logo1 from "./Images/Ftrack_logo1.png";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Password validation regex
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/;

  const handleSignup = async (e) => {
    e.preventDefault();

    // Prevent empty spaces in input fields
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Fields cannot contain spaces.");
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email.toLowerCase());
      if (signInMethods.length > 0) {
        setError("Email already registered");
        navigate("/login");
        return;
      }

      // Validate password using regex
      if (!passwordRegex.test(password)) {
        setError("Password should have atleast 1 uppercase, 1 lowercase, 1 digit & 1 special char.");
        return;
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Register the user
      await registerWithEmailAndPassword(email.toLowerCase(), password);

      // Show success alert
      alert("Signup successful! ");
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email already exists. Please login instead.");
      } else {
        setError("Signup failed. Try again later.");
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, { vapidKey: "YOUR_PUBLIC_VAPID_KEY" });
        await setDoc(doc(db, "users", user.uid), { email: user.email, fcmToken: token });
      }
      navigate("/dashboard");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email already exists. Please login instead.");
      } else {
        setError("Signup failed. Try again later.");
      }
    }
  };


  return (

    <div className="container  d-flex justify-content-center align-items-center min-vh-100">
      <div className="row shadow-lg rounded-4 overflow-hidden log-sign-cont">

        {/* Left Side - Image */}
        <div className="col-md-6 d-none d-md-block p-0 sign-img-cont">
          <img
            src={WelMsg}
            // src={Logo1}
            alt="Signup"
            className="img-fluid h-100"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Right Side - Signup Form */}
        <div className="col-md-6  p-4">
          <div className="card p-4 shadow-lg inner-cont">
            <h2 className="text-center mb-4">Signup</h2>
            {error && <p className="alert alert-danger text-center">{error}</p>}

            <form onSubmit={handleSignup}>
              <div className="mb-3 position-relative">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="mb-3 position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-2 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="d-flex justify-content-center">
                <button className="btn submit-btn w-50 mt-2" type="submit">Submit</button>
              </div>
            </form>

            <div className="text-center mt-3">
              <p className="text-muted">or continue with</p>
              <div className="d-flex justify-content-center">
                <button className="btn w-50 google-btn" onClick={handleGoogleSignup}>
                  <FcGoogle className="me-2" /> Google
                </button>
              </div>
            </div>

            <div className="text-center mt-3">
              <p className="mb-1">Already have an account?</p>
              <Link to="/login">
                <button type="button" className="btn btn-secondary w-50 rounded-4">Login</button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>



  );
};

export default Signup;

