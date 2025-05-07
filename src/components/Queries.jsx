
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase"; 

//  Fetch Expired Products
export const fetchExpiredProducts = async () => {
    const today = Timestamp.fromDate(new Date()); // Convert JS Date to Firestore Timestamp
    try {
      const q = query(
        collection(db, "scanned_products"),
        where("expiryDate", "<=", today) // Correct Firestore Timestamp comparison
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching expired products:", error);
      return [];
    }
};

//  Fetch Fresh Products
export const fetchFreshProducts = async () => {
    const today = Timestamp.fromDate(new Date()); 
    try {
      const q = query(
        collection(db, "scanned_products"),
        where("expiryDate", ">", today) //  Correct Firestore Timestamp comparison
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching fresh products:", error);
      return [];
    }
};

//  Fetch Expiring Soon Products
export const fetchExpiringSoonProducts = async (days = 7) => {
  if (!days || isNaN(days)) days = 7; // Default to 7 if invalid

  const today = Timestamp.fromDate(new Date());
  const nextDays = new Date();
  nextDays.setDate(nextDays.getDate() + days);
  const nextTimestamp = Timestamp.fromDate(nextDays);

  try {
    const q = query(
      collection(db, "scanned_products"),
      where("expiryDate", ">", today),
      where("expiryDate", "<=", nextTimestamp)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching expiring soon products:", error);
    return [];
  }
};
