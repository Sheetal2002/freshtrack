import React from "react";
import "./home.css";

import Aboutus from "./Aboutus";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

const HomePage = () => {
  return (
    <div className="container-fluid px-0 mainpage-wrapper">

      <nav className="home-navbar  py-0">

      </nav>

      {/* Hero Section */}
      <header className="text-center">
        <h1 className=" catchy-text ">Never Miss an Expiry with  FreshTrack !</h1>
      </header>


      {/* (How It Works) */}
      <section className="about-section text-center py-5">

        <p className="description text-dark">FreshTrack helps you track expiry dates for food, medicines, and other essentials. Simply scan barcodes or enter details manually, and get timely reminders before items expire. Stay organized, reduce waste, and keep your products fresh with ease!</p>
        <Aboutus />
        <button className="btn btn-success btn-lg sign-btn">
          <Link to="/signup" className="text-dark text-decoration-none">Get Started</Link>
        </button>
      </section>

      {/* Features Section (Why Use FreshTrack?) */}
      <section className="about-section text-center py-5">
        <h2 className="text-white">Why Use FreshTrack?</h2>
        <div className="container d-flex justify-content-around flex-wrap mt-4">
          <div className="card feature-card" >
            <i className="fas fa-barcode fa-3x text-primary mb-3"></i>
            <h5>Easy Barcode Scanning</h5>
            <p className="text-muted">Scan barcodes to add expiry dates automatically.</p>
          </div>
          <div className="card feature-card">
            <i className="fas fa-bell fa-3x text-danger mb-3"></i>
            <h5>Smart Reminders</h5>
            <p className="text-muted">Get notifications before your products expire.</p>
          </div>
          <div className="card feature-card">
            <i className="fas fa-chart-line fa-3x text-success mb-3"></i>
            <h5>Track & Manage</h5>
            <p className="text-muted">Easily track expiry dates from a single dashboard.</p>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-5 container">
        <h3 className="text-center text-dark">Frequently Asked Questions</h3>
        <div className="accordion mt-4" id="faqAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                How do I get notifications for expiry dates?
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                You will receive notifications via email or mobile app alerts.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                Can I edit product details after entry?
              </button>
            </h2>
            <div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Yes, you can edit product details anytime from the dashboard.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Is FreshTrack free to use?
              </button>
            </h2>
            <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Yes! right now FreshTrack offers a free version with core features. A premium plan with additional features may be available in the future.
              </div>
            </div>
          </div>
        </div>
      </section>

      

    </div>
  );
};

export default HomePage;
