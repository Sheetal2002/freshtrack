
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { db } from "../firebase/firebase";
import { auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import Sidebar from "./Sidebar";
import ProductStatus from "./ProductStatus";
import {
  fetchExpiredProducts,
  fetchFreshProducts,
  fetchExpiringSoonProducts,
} from "./Queries";
import "./mainHeader.css";

function Body() {
  const [scannedProducts, setScannedProducts] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [days, setDays] = useState(7);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  
 
  useEffect(() => {
    fetchProducts();
  }, [filterType, days]);

  useEffect(() => {
    const handleClickOutside = () => setSelectedProductId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let products = [];
      if (filterType === "expired") {
        products = await fetchExpiredProducts();
      } else if (filterType === "fresh") {
        products = await fetchFreshProducts();
      } else if (filterType === "expiringSoon") {
        products = await fetchExpiringSoonProducts(days);
      } else {
        const querySnapshot = await getDocs(collection(db, "scanned_products"));
        products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
      setScannedProducts(products);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching scanned products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    if (!auth.currentUser) {
      alert("You must be logged in to delete a product.");
      return;
    }

    try {
      const docRef = doc(db, "scanned_products", productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const productData = docSnap.data();
        if (productData.userId === auth.currentUser.uid) {
          await deleteDoc(docRef);
          alert("Product deleted successfully.");
          setScannedProducts((prev) =>
            prev.filter((p) => p.id !== productId)
          );
        } else {
          alert("You are not authorized to delete this product.");
        }
      } else {
        alert("Product not found.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = scannedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(scannedProducts.length / productsPerPage);

  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (number) => setCurrentPage(number);

  const btnClassMap = {
    all: "filter-btn-all",
    fresh: "filter-btn-fresh",
    expiringSoon: "filter-btn-soon",
    expired: "filter-btn-exp",
  };

  return (
    <Container fluid>
      <Row>
        <Col md={3} className="text-white">
          <Sidebar />
        </Col>

        <Col md={9} className="content body-cont">
          {/* <NotificationList notifications={notifications} />   */}
          <div className="d-flex justify-content-between mt-3">
            <h2 className="mt-4">Products</h2>
            <div>
              <Link to="/voiceinput2" className="btn mb-3 add-product">
                Add Product
              </Link>
               </div>
          </div>
          <p className="fw-bold">Click on these buttons to know your products !</p>

          <div className="row">
            {["all", "fresh", "expiringSoon", "expired"].map((type) => (
              <div
                key={type}
                className={`text-dark col text-center px-1 py-3 rounded ${btnClassMap[type]} ${filterType === type ? "active-filter" : ""
                  }`}
                onClick={() => setFilterType(type)}
              >
                <p>
                  {type === "all"
                    ? "All Products"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
              </div>
            ))}
          </div>

          {filterType === "expiringSoon" && (
            <div className="mt-3">
              <label>Show products expiring in (days): </label>
              <input
                type="number"
                value={days || ""}
                onChange={(e) => setDays(parseInt(e.target.value))}
                placeholder="Enter days"
                className="form-control"
                min="1"
              />
            </div>
          )}



          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : scannedProducts.length === 0 ? (
            <p>No products found for {filterType}.</p>
          ) : (
            <>
              <table className="table">
                <thead className="table-dark">
                  <tr>
                    <th>Product Name</th>
                    <th>Manufacturer</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => (
                    <tr
                      key={product.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProductId(product.id);
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor:
                          selectedProductId === product.id ? "#f5f5f5" : "",
                      }}
                    >
                      <td>{product.name}</td>
                      <td>{product.manufacturer}</td>
                      <td>
                        {product.expiryDate?.toDate
                          ? product.expiryDate.toDate().toLocaleDateString()
                          : "No Date"}
                      </td>
                      <td>
                        <ProductStatus expiryDate={product.expiryDate} />
                      </td>
                      <td>
                        {selectedProductId === product.id && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => goToPage(index + 1)}
                    className={`btn btn-sm ${currentPage === index + 1
                      ? "btn-primary"
                      : "btn-outline-secondary"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Body;



