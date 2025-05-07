import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase"; 
import { FaEnvelope } from "react-icons/fa"; 

const ResetForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox."); 
      setError("");
    } catch (error) {
      setError(error.message || "Failed to send reset email.");
    }
  };

  return (
   
    <div className="container d-flex  justify-content-center align-items-center" >

    <div className="card shadow-lg p-5"  
     style={{ backgroundColor: 'rgb(214, 201, 201)',width: '800px'  }}>
     

    <h3 className="text-center mb-3 ">Reset Password</h3>
    
    {error && <div className="alert alert-danger text-center">{error}</div>}
        
         <div className="mb-4 input-group ">
             <input
                  type="email"
                  className="form-control fs-4"
                  id="reset-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                 required
                 />
                 <FaEnvelope className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted" />
                          
             </div>

    <div className="d-grid gap-4 ">
      
      <button className="btn reset-btns fs-5 w-50 mx-auto rounded-4 " id="reset-pass" onClick={handleForgotPassword}>
        Reset Password
      </button>
      <button type="button" className="btn reset-btns  btn-secondary w-50 rounded-4 mx-auto"  onClick={onClose}>Login</button>
  
      </div>
  </div>
</div>

  );
};

export default ResetForm;
