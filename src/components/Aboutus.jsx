
import React from 'react';
import './about.css';
import { Carousel } from "react-bootstrap";

const Aboutus = () => {
  return (
    <section className="how-it-works text-center py-5">
      <div className="custom-container">
        
        <h2 className="text-style">How FreshTrack Works?</h2>
        <Carousel indicators={false} interval={3000}>
          <Carousel.Item>
            <div className="slide-content d-block w-100">
              <i className="fas fa-keyboard fa-3x text-light mb-3"></i>
              <h5 className="text-dark text-style"> 1️⃣ Add Manually</h5>
              <br />
              <p className="text-dark">Enter product details like name & expiry date.</p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <div className="slide-content d-block w-100">
              <i className="fas fa-list-alt fa-3x text-light mb-3"></i>
              <h5 className="text-dark text-style"> 2️⃣ Manage Products</h5>
              <br />
              <p className="text-dark">View and edit saved products in your list.</p>
            </div>
          </Carousel.Item>

          <Carousel.Item>
            <div className="slide-content d-block w-100">
              <i className="fas fa-bell fa-3x text-light mb-3"></i>
              <h5 className="text-dark text-style"> 3️⃣ Get Reminders</h5>
              <br />
              <p className="text-dark">Receive alerts before expiry dates.</p>
            </div>
          </Carousel.Item>
        </Carousel>
      </div>
    </section>
  );
};

export default Aboutus;
