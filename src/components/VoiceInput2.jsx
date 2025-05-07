import { useState, useEffect, useRef } from 'react';
import { getAuth } from "firebase/auth";
import { db } from "../firebase/firebase";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { collection, addDoc, Timestamp, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./addbyuser.css";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;



const parseGS1128 = (data) => {
    const results = {};
    let index = 0;

    while (index < data.length) {
        const ai = data.substr(index, 2);
        index += 2;

        switch (ai) {
            case "01": {
                results.gtin = data.substr(index, 14);
                index += 14;
                break;
            }
            case "17":
            case "13":
                {
                    const expiry = data.substr(index, 6);
                    results.expiryDate = `20${expiry.slice(0, 2)}-${expiry.slice(2, 4)}-${expiry.slice(4, 6)}`;
                    index += 6;
                    break;
                }
            case "10": {
                // Batch number is variable length, so read until end or next AI
                let batch = "";
                while (index < data.length) {
                    const nextTwo = data.substr(index, 2);
                    if (["01", "17", "10"].includes(nextTwo)) break; // next AI detected
                    batch += data[index];
                    index++;
                }
                results.batch = batch;
                break;
            }
            default: {
                console.warn("Unknown AI:", ai);
                // Skip unknown AI safely (optional)
                index += 2;
                break;
            }
        }
    }

    return results;
};

const ProductForm = () => {
    const [gtin, setGtin] = useState('');
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [scanning, setScanning] = useState(false);

    const videoRef = useRef(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    useEffect(() => {
        codeReader.current = new BrowserMultiFormatReader();

        return () => {
            // Cleanup on unmount
            if (codeReader.current) {
                stopCamera();
            }
        };
    }, []);


    const scannedOnce = useRef(false); // Add this line at top-level inside the component

    const startCamera = async () => {
        setScanning(true);
        scannedOnce.current = false; // Reset for a new scan session

        try {
            await codeReader.current.decodeFromVideoDevice(null, videoRef.current, async (result, err) => {
                if (result && !scannedOnce.current) {
                    scannedOnce.current = true; // Prevent further scans
                    const raw = result.getText();
                    const parsed = parseGS1128(raw);
                    console.log("Scanned:", parsed);
                    if (parsed.gtin) {
                        setGtin(parsed.gtin);
                    }
                    if (parsed.expiryDate) {
                        setExpiryDate(parsed.expiryDate);
                    }
                    stopCamera(); // Stop camera after successful scan
                }
            });
        } catch (error) {
            console.error("Error starting scanner:", error);
            alert("Camera access failed.");
            setScanning(false);
        }
    };


    const stopCamera = () => {
        if (codeReader.current) {
            try {
                const videoElem = videoRef.current;
                const stream = videoElem?.srcObject;

                if (stream && stream.getTracks) {
                    stream.getTracks().forEach((track) => track.stop());
                }

                videoElem.srcObject = null;
                setScanning(false);
            } catch (err) {
                console.error("Error stopping camera:", err);
            }
        }
    };


    const startVoiceInput = (fieldSetter, isDate = false) => {
        recognition.start();
        recognition.onresult = (event) => {
            const voiceText = event.results[0][0].transcript.trim();
            console.log('Voice input:', voiceText);
            if (isDate) {
                const parsedDate = parseToDate(voiceText);
                console.log(parsedDate);
                if (parsedDate) {
                    fieldSetter(parsedDate);
                } else {
                    alert("Couldn't understand date. Please try again.");
                }
            } else {
                fieldSetter(voiceText);
            }
        };
    };


    const parseToDate = (str) => {
        const cleaned = str.replace(/[.,]/g, '').trim();
        const parts = cleaned.split(/[\/\- ]/);
        if (parts.length === 3) {
            let [day, month, year] = parts;
            if (year.length === 2) {
                year = "19" + year;
            }
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');

            return `${year}-${month}-${day}`;
        }

        const date = new Date(str);
        if (!isNaN(date)) {
            return date.toISOString().split('T')[0];
        }
        return null;
    };

    // GTIN Validation (8-14 digits)
    const isValidGTIN = (gtin) => /^[0-9]{8,14}$/.test(gtin);

    // Product Name & Manufacturer Validation (Only alphabets & spaces, 2-50 characters)
    const isValidString = (input) => /^[a-zA-Z\s]{2,50}$/.test(input);

    const handleAddProduct = async () => {
        const auth = getAuth();
        const userId = auth.currentUser.uid; // Get current user's UID

        // Get the current date
        const today = new Date().setHours(0, 0, 0, 0);
        const inputDate = new Date(expiryDate).setHours(0, 0, 0, 0);
        if (inputDate < today) {
            setError("Product Already Expired.");
            return;
        }

        const trimmedGtin = gtin.trim();
        const trimmedName = name.trim();
        const trimmedManufacturer = manufacturer.trim();

        if (!trimmedGtin || !trimmedName || !expiryDate || !trimmedManufacturer) {
            setError("All fields are required.");
            return;
        }

        if (!isValidGTIN(trimmedGtin)) {
            setError("Invalid GTIN. It must be 8-14 digits long.");
            return;
        }

        if (!isValidString(trimmedName) || !isValidString(trimmedManufacturer)) {
            setError("Only alphabets & spaces allowed (2-50 characters).");
            return;
        }

        setLoading(true);

        try {
            // Check if GTIN already exists
            const q = query(collection(db, "scanned_products"), where("gtin", "==", trimmedGtin));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setError("This GTIN is already registered.");
                setLoading(false);
                return;
            }

            // Create a reference for the new product document
            const productId = doc(collection(db, "scanned_products")).id; // Generate a new unique document ID

            // Add product with userId set
            await setDoc(doc(db, 'scanned_products', productId), {
                gtin: trimmedGtin,
                name: trimmedName,
                expiryDate: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : null,
                manufacturer: trimmedManufacturer,
                userId: userId, // Store the current user's UID
                timestamp: serverTimestamp(),
            });

            alert("Product added successfully!");
            setGtin("");
            setName("");
            setExpiryDate("");
            setManufacturer("");
        } catch (error) {
            console.error("Error adding product:", error);
            setError("Failed to add product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAddProduct();
    };

    const handleReset = () => {
        setGtin('');
        setName('');
        setManufacturer('');
        setExpiryDate('');
    };

    return (
        <div className="container my-5">
            <div className="card p-5 add-user-card ">
                <h2 className="text-center mb-4 adduser-heading">Manually Add Product</h2>
                <video ref={videoRef} style={{ width: "100%", maxHeight: 300 }} />
                <div className="mt-3 text-center">
                    {!scanning ? (
                        <button className="btn btn-success me-2" onClick={startCamera}>
                            Start Camera
                        </button>
                    ) : (
                        <button className="btn btn-danger" onClick={stopCamera}>
                            Stop Camera
                        </button>
                    )}
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit} onReset={handleReset}>
                    <div className="mb-3">
                        <label className="form-label">GTIN:</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={gtin}
                                onChange={(e) => setGtin(e.target.value)}
                                required
                            />
                            <button type="button" className="btn btn-secondary" onClick={() => startVoiceInput(setGtin)}>
                                🎤
                            </button>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Product Name:</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <button type="button" className="btn btn-secondary" onClick={() => startVoiceInput(setName)}>
                                🎤
                            </button>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Manufacturer:</label>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                required
                            />
                            <button type="button" className="btn btn-secondary" onClick={() => startVoiceInput(setManufacturer)}>
                                🎤
                            </button>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Expiry Date:</label>
                        <div className="input-group">
                            <input
                                type="date"
                                className="form-control"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                required
                            />
                            <button type="button" className="btn btn-secondary" onClick={() => startVoiceInput(setExpiryDate, true)}>
                                🎤
                            </button>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between">
                        <button type="submit" className="btn btn-success w-50" disabled={loading}>
                            {loading ? "Adding..." : "Add Product"}
                        </button>
                        <button type="reset" className="btn btn-danger w-50">
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;


