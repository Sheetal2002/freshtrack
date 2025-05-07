
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import DashBoard from "./components/DashBoard";
import ResetForm from "./components/ResetForm";
import HomePage from "./components/HomePage";
import Notification from "./components/Notification";
import Body from "./components/Body";
import Header from "./components/Header";
import Footer from "./components/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import AboutFreshT from "./components/AboutFreshT";
import BarcodeScanner from "./components/BarcodeScanner";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from "firebase/auth";
import { saveFCMToken } from "./utils/saveFCMToken";
import { auth } from "./firebase/firebase";
import VoiceInput2 from "./components/VoiceInput2";



function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await saveFCMToken(u);
        console.log(u) 
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        }).catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  return (
    <Router>
      <Header userdata={user}></Header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resetForm" element={<ResetForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/voiceinput2" element={<VoiceInput2 />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/body" element={<Body />} />
        <Route path="/aboutfresht" element={<AboutFreshT />} />
        <Route path="/scan" element={<BarcodeScanner />} />
        <Route path="/notification" element={<Notification/>} />
      </Routes>
      <ToastContainer />
      <Footer></Footer>
    </Router>
  );
}

export default App;
