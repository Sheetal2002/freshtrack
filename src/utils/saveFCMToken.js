// utils/saveFCMToken.js
import { getToken } from "firebase/messaging";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { messaging } from "../firebase/firebase";


export const saveFCMToken = async (user) => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: "BHAZxQesx73xqkGSw68zDnm9UaX4cOvLNpnvY25FdtTEL4mNFgoRpYwS36pAKn7JR_U8kVjQAAIJjM9l8BzkCPs",
      });

      if (currentToken) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        const storedToken = userSnap.exists() ? userSnap.data().fcmToken : null;

        if (storedToken !== currentToken) {
          await setDoc(userDocRef, {
            fcmToken: currentToken,
          }, { merge: true });

          console.log("✅ FCM Token saved/updated in Firestore");
        } else {
          console.log("⏩ FCM Token unchanged, no update needed");
        }
      } else {
        console.log("❌ No registration token available. User may have blocked notifications.");
      }
    } catch (error) {
      console.log("🔥 Error while saving FCM token:", error);
    }
  } else {
    console.log("Notification permission not granted.");
  }
};
