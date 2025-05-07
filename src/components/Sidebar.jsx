
import React, { useState, useEffect } from "react";
import { Col, Card, ListGroup, Spinner } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase"; 
import { FaUserCircle, FaBox, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./Sidebar.css"; 

const Sidebar = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [totalProducts, setTotalProducts] = useState(0);
  const [expiredProducts, setExpiredProducts] = useState(0);
  const [freshProducts, setFreshProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductCounts();
  }, []);

  const fetchProductCounts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "scanned_products"));
      let total = 0, expired = 0, fresh = 0;

      querySnapshot.forEach((doc) => {
        total++;
        const expiryDate = doc.data().expiryDate?.toDate(); // Firestore Timestamp
        if (expiryDate && expiryDate < new Date()) {
          expired++;
        } else {
          fresh++;
        }
      });

      setTotalProducts(total);
      setExpiredProducts(expired);
      setFreshProducts(fresh);
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Col md={10} className="sidebar bg-dark text-white p-1 ">
      {/* User Profile Section */}
      <Card className="bg-secondary text-white text-center shadow-lg">
        <Card.Body>
          <FaUserCircle size={80} />
          <Card.Title className="mt-3">{user?.email || "Guest"}</Card.Title>
          <Card.Subtitle className="text-light">Welcome Back!</Card.Subtitle>
        </Card.Body>
      </Card>

      {/* Product Counts Section */}
      <ListGroup variant="flush" className="mt-3">
        {loading ? (
          <div className="text-center p-3">
            <Spinner animation="border" variant="light" />
          </div>
        ) : (
          <>
            <ListGroup.Item className="d-flex justify-content-between align-items-center bg-dark text-white">
              <span><FaBox className="me-2" /> Total Products</span> <strong>{totalProducts}</strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center bg-dark text-danger">
              <span><FaTimesCircle className="me-2" /> Expired</span> <strong>{expiredProducts}</strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between align-items-center bg-dark text-success">
              <span><FaCheckCircle className="me-2" /> Fresh</span> <strong>{freshProducts}</strong>
            </ListGroup.Item>
          </>
        )}
      </ListGroup>
    </Col>
  );
};

export default Sidebar;
