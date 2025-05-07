import React, { useState, useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";
import { db } from "../firebase/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

const BarcodeScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("Point your camera at a barcode.");
  const videoRef = useRef(null);

  useEffect(() => {
    checkCameraAccess();
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const checkCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setMessage("Camera access granted. Scanning...");
    } catch (err) {
      setMessage("Camera access denied. Please allow access to scan.");
    }
  };

  const startScanner = () => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          facingMode: "environment",
        },
      },
      decoder: {
        readers: ["ean_reader", "upc_reader", "code_128_reader"],
      },
    }, (err) => {
      if (err) {
        console.error(err);
        setMessage("Error initializing scanner.");
        return;
      }
      Quagga.start();
      setMessage("Scanning...");
    });

    Quagga.onDetected((data) => {
      const code = data.codeResult.code;
      if (code) {
        Quagga.stop();
        handleScan(code);
      }
    });
  };

  const stopScanner = () => {
    Quagga.offDetected();
    Quagga.stop();
  };

  const handleScan = (barcodeText) => {
    setScannedData(barcodeText);
    setMessage("Barcode detected successfully!");
    extractBarcodeData(barcodeText);
  };

  const extractBarcodeData = async (barcode) => {
    const gtinMatch = barcode.match(/01(\d{14})/);
    const gtin = gtinMatch ? gtinMatch[1] : null;

    const expiryMatch = barcode.match(/17(\d{6})/);
    const expiryRaw = expiryMatch ? expiryMatch[1] : null;
    const expiryDate = expiryRaw
      ? `20${expiryRaw.substring(0, 2)}-${expiryRaw.substring(2, 4)}-${expiryRaw.substring(4, 6)}`
      : null;

    if (!gtin) {
      setMessage("No valid GTIN found in barcode.");
      return;
    }

    setMessage("Fetching product details...");
    await fetchProductDetails(gtin, expiryDate);
  };

  const fetchProductDetails = async (gtin, expiryDate) => {
    try {
      const q = query(collection(db, "products"), where("gtin", "==", gtin));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          const fetchedProduct = {
            name: productData.name || "Unknown",
            gtin: gtin,
            expiryDate: expiryDate || "Not Available",
            manufacturer: productData.manufacturer || "Unknown",
            category: productData.category || "Not Specified",
          };

          setProduct(fetchedProduct);
          saveToFirestore(fetchedProduct);
        });
      } else {
        setProduct({
          name: "",
          gtin: gtin,
          expiryDate: expiryDate,
          manufacturer: "",
          category: "",
        });
        setMessage("Product not found. Please enter details.");
      }
    } catch (error) {
      setMessage("Error fetching product from database.");
    }
  };

  const saveToFirestore = async (productData) => {
    try {
      await addDoc(collection(db, "scanned_products"), {
        ...productData,
        timestamp: new Date(),
      });
      setMessage("Product saved to database!");
    } catch (error) {
      setMessage("Error saving product to database.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">Scan Barcode</h2>

      <div
        ref={videoRef}
        style={{ height: "500px" }}
        className="border-4 border-blue-300 rounded-xl shadow-lg"
      ></div>

      {scannedData && (
        <p className="mt-4 text-green-600 font-medium">Scanned Code: {scannedData}</p>
      )}

      {product ? (
        <div className="mt-6 p-4 border rounded-lg shadow-md w-full max-w-md bg-white text-gray-700">
          <h3 className="text-xl font-bold mb-2">Product Details</h3>
          <p><span className="font-semibold">Name:</span> {product.name}</p>
          <p><span className="font-semibold">GTIN:</span> {product.gtin}</p>
          <p><span className="font-semibold">Expiry Date:</span> {product.expiryDate}</p>
          <p><span className="font-semibold">Manufacturer:</span> {product.manufacturer}</p>
          <p><span className="font-semibold">Category:</span> {product.category}</p>
        </div>
      ) : (
        <p className="mt-4 text-red-600 font-medium">{message}</p>
      )}

      {product && product.name === "" && (
        <div className="mt-4 w-full max-w-md">
          <h3 className="text-lg font-bold mb-2">Add Product Details</h3>
          <input
            type="text"
            placeholder="Product Name"
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Manufacturer"
            onChange={(e) => setProduct({ ...product, manufacturer: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Category"
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="border p-2 mb-2 w-full rounded"
          />
          <button
            onClick={() => saveToFirestore(product)}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Product
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner2;