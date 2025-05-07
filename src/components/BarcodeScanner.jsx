
import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { db } from "../firebase/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

const BarcodeScanner = () => {
    const [scannedData, setScannedData] = useState(null);
    const [product, setProduct] = useState(null);
    const [message, setMessage] = useState("Point your camera at a barcode.");
    const videoRef = useRef(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        checkCameraAccess();
        startScanner(codeReader);
        return () => stopScanner(codeReader);
    }, []);

    const checkCameraAccess = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setMessage("Camera access granted. Scanning...");
        } catch (err) {
            setMessage("Camera access denied. Please allow access to scan.");
        }
    };

    const startScanner = async (codeReader) => {
        try {
            const devices = await codeReader.listVideoInputDevices();
            if (devices.length > 0) {
                codeReader.decodeFromVideoDevice(
                    devices[0].deviceId,
                    videoRef.current,
                    (result, err) => {
                        if (result) {
                            stopScanner(codeReader);
                            handleScan(result.getText());
                        } else if (err) {
                            handleScanError(err);
                        }
                    }
                );
            } else {
                setMessage("No camera devices found.");
            }
        } catch (error) {
            setMessage("Error accessing scanner. Please reload the page.");
        }
    };

    const stopScanner = (codeReader) => {
        if (codeReader) {
            codeReader.reset();
        }
    };

    const handleScan = (barcodeText) => {
        if (barcodeText) {
            setScannedData(barcodeText);
            setMessage("Barcode detected successfully!");
            extractBarcodeData(barcodeText);
        } else {
            setMessage("Scanned barcode is empty. Please try again.");
        }
    };

    const handleScanError = (err) => {
        if (err instanceof NotFoundException) {
            setMessage("No barcode found. Please point the camera again.");
        } else {
            setMessage("An error occurred while scanning.");
        }
    };

   
    const extractBarcodeData = async (barcode) => {
        console.log("Scanned Barcode:", barcode);

        // 1. Check for GS1 Format (e.g., 01xxxxxxxxxxxxxx + 17yyMMdd)
        let gtinMatch = barcode.match(/01(\d{14})/); // GS1 format
        let gtin = gtinMatch ? gtinMatch[1] : null;

        // 2. Fallback: Raw GTIN-13 (e.g., scanned directly)
        if (!gtin && /^\d{12,14}$/.test(barcode)) {
            gtin = barcode.padStart(14, "0"); // Normalize to GTIN-14 format
        }

        // 3. Expiry from GS1 Format
        const expiryMatch = gtin.match(/17(\d{6})/);
        const expiryRaw = expiryMatch ? expiryMatch[1] : null;



        const expiryDate = expiryRaw
            ? `20${expiryRaw.substring(0, 2)}-${expiryRaw.substring(2, 4)}-${expiryRaw.substring(4, 6)}`
            : null;

        console.log("expiryDate:", expiryMatch);
        // 4. Validation
        if (!gtin) {
            setMessage("❌ No valid GTIN found in barcode.");
            return;
        }

        setMessage("🔍 Fetching product details...");
        const productDetails = await fetchFromUPCitemDB(gtin);
        console.log(productDetails);
        await fetchProductDetails(gtin, expiryDate);
    };

    const fetchFromUPCitemDB = async (gtin) => {
        try {
            const corsProxy = "https://cors-anywhere.herokuapp.com/";
            const upc = "8901072002478";
            const url = `${corsProxy}https://api.upcitemdb.com/prod/trial/lookup?upc=${gtin}`;
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    // "user_key": "YOUR_API_KEY", // Only needed if you're using a paid plan
                },
            });

            const data = await response.json();

            if (data && data.items && data.items.length > 0) {
                const item = data.items[0];

                return {
                    name: item.title,
                    brand: item.brand,
                    category: item.category,
                    description: item.description,
                    image: item.images && item.images.length > 0 ? item.images[0] : null,
                };
            } else {
                console.warn("No product found.");
                return null;
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
            return null;
        }
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

            <video
                ref={videoRef}
                width="400"
                height="400"
                className="border-4 border-blue-300 rounded-xl shadow-lg"
            />

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

// src/components/BarcodeScanner.jsx

// import React, { useEffect, useRef, useState } from "react";
// import { BrowserMultiFormatReader } from "@zxing/browser";

// const BarcodeScanner = () => {
//   const videoRef = useRef(null);
//   const [result, setResult] = useState(null);
//   const [scanning, setScanning] = useState(true);

//   useEffect(() => {
//     const codeReader = new BrowserMultiFormatReader();

//     codeReader
//       .listVideoInputDevices()
//       .then((videoInputDevices) => {
//         if (videoInputDevices.length === 0) {
//           console.warn("No video devices found");
//           return;
//         }

//         const deviceId = videoInputDevices[0].deviceId;

//         codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, error) => {
//           if (result && scanning) {
//             setResult(result.getText());
//             setScanning(false);
//             codeReader.reset(); // stop scanner
//           }
//         });
//       })
//       .catch((err) => console.error("Error accessing camera:", err));
//     return () => {
//       codeReader.reset();
//     };
//   }, [scanning]);

//   return (
//     <div>
//       <h2>📷 Scan Barcode</h2>
//       <video ref={videoRef} width="400" height="400" style={{ width: "100%", maxWidth: "500px" }} />
//       {result && <p>✅ Scanned Result: <strong>{result}</strong></p>}
//       {!scanning && (
//         <button onClick={() => setScanning(true)}>🔄 Scan Again</button>
//       )}
//     </div>
//   );
// };

export default BarcodeScanner;




