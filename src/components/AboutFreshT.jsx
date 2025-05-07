import React from 'react';
import {
  Container, Row, Col, Card
} from 'react-bootstrap';
import Logo1 from "./Images/Ftrack_logo1.png";

const AboutFreshT = () => {
  return (
    <div className="p-5 aboutFT">
      <Row className="justify-content-center mb-4">
        <Col md={8} className="text-center">

          <img src={Logo1} alt="FreshTrack Logo"
            fluid="true"
            rounded="true"
          />
        </Col>
      </Row>      
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-3">About Us</h2>
          <p className="text-dark text-center">
            FreshTrack is your smart solution for managing expiry dates of food, medicines, and packaged products.
            By scanning GS1-128 barcodes, FreshTrack notifies users before items expire—reducing waste and ensuring safety.
            We combine the power of barcode scanning, Firebase backend, and real-time notifications to provide a seamless experience.
          </p>
        </Col>
      </Row>      
      <Row className="mb-5">
        <Col md={6} >
          <Card className="shadow-lg h-100  ">
            <Card.Body >
              <Card.Title>Our Mission</Card.Title>
              <Card.Text>
                To empower users with real-time tracking of product expiry, reducing waste, and promoting safety through smart technology and modern tools like React, Firebase, and barcode scanning.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-lg h-100  ">
            <Card.Body>
              <Card.Title>Why We Built This?</Card.Title>
              <Card.Text>
                Because your health and product quality matter. We help you never miss an expiry date again, by putting smart reminders and product tracking at your fingertips.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>
          <h4 className="text-center mb-3">Our Team</h4>
          <p className="text-dark text-center">
            We’re a team of students who collaborated to build a meaningful project that could make everyday life a little easier.
            FreshTrack was built with a simple goal — to help people keep track of expiry dates on food and medicines using technology we’re passionate about.
            <br /><br />
          </p>
          <h5 className="mt-3 text-dark text-center">Built by : Sheetal Rawat & Sheetal Patel.</h5>

        </Col>
      </Row>
    </div>
  );
};

export default AboutFreshT;
