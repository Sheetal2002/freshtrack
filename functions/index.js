
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fetch from "node-fetch";

initializeApp();
const db = getFirestore();


// Your EmailJS config
const EMAILJS_SERVICE_ID = "service_2t0fzmh";
const EMAILJS_TEMPLATE_ID = "template_80eqces";
const EMAILJS_PUBLIC_KEY = "UsHzL_MQoRI8qv5oW"; // used if needed
const EMAILJS_PRIVATE_KEY = "secret_XGHWQYw8ysLY2yWsPCbA0"; // used for secure server-side call

async function sendEmailNotification(email, name, expiryDate, type) {
  const templateParams = {
    to_email: email,
    product_name: name,
    expiry_date: expiryDate,
    notification_type: type === "final" ? "Final Expiry Alert" : "Early Reminder",
  };


  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${EMAILJS_PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY, // still required
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    throw new Error(`EmailJS error: ${response.statusText}`);
  }
}


export const sendExpiryNotifications = onSchedule(
  {
    schedule: "every day 06:43",
    timeZone: "Asia/Kolkata",
  },
  async () => {

    const now = new Date();
    const start = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const final = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // proper 2-day calc

    const formattedFinal = final.toISOString().split("T")[0];

    const productsSnapshot = await db.collection("scanned_products").get();
    const promises = [];

    for (const doc of productsSnapshot.docs) {
      const product = doc.data();

      if (!product.expiryDate || !product.name) continue;

      const expiryDate = product.expiryDate.toDate(); // Convert Firestore Timestamp
      const expiryString = expiryDate.toISOString().split("T")[0];
      const notifiedDates = product.notifiedDates || [];

      console.log(`🎯 Total notifications formattedFinal: ${product.name}`);
      console.log(`🎯 Total notifications expiryString: ${expiryString}`);
      const userId = product.userId;
      if (!userId) return;
      // Fetch user details
      console.log(`Userid: ${userId}`);
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) return;
      const userData = userDoc.data(); 
      const email = userData.email;
      const fcmToken = userData.fcmToken;
      console.log(`User: ${email}, Token: ${fcmToken}`);
      // Final Reminder: 2 days before expiry
      if (expiryString === formattedFinal && !notifiedDates.includes(formattedFinal)) {

        const message = {
          token: userData.fcmToken,
          notification: {
            title: "⚠️ Final Expiry Alert",
            body: `Heads up! "${product.name}" will expire in 2 days.`,
          },
          data: {
            productId: doc.id,
            expiryDate: expiryString,
            name: product.name,
            type: "final",
          },
        };

        promises.push(
          getMessaging().send(message)
            .then(async () => {
              await sendEmailNotification(userData.email, product.name, expiryString, "final");
              db.collection("scanned_products").doc(doc.id).update({
                notifiedDates: FieldValue.arrayUnion(formattedFinal),
              });
              db.collection("notifications").add({
                title: "⏳ FreshTrack Reminder",
                body: `Product "${product.name}" expires on ${expiryString}`,
                time: FieldValue.serverTimestamp(),
                status:"Unseen",
                userId:userId
              });
            })
            .catch((error) => {
              console.log(error);
              db.collection("notification_errors").add({
                productId: doc.id,
                error: error.message,
                time: FieldValue.serverTimestamp(),
              })
            }
            )
        );
        continue;
      }

      // Early Reminder: 4–6 days before expiry
      if (expiryDate >= start && expiryDate <= end) {
        if (notifiedDates.includes(expiryString)) continue;

        const message = {
          token: userData.fcmToken,
          notification: {
            title: "⏳ FreshTrack Reminder",
            body: `Product "${product.name}" expires on ${expiryString}`,
          },
          data: {
            productId: doc.id,
            expiryDate: expiryString,
            name: product.name,
            type: "early",
          },
        };
        promises.push(
          getMessaging().send(message)
            .then(async () => {
              await sendEmailNotification(userData.email, product.name, expiryString, "final");
              db.collection("scanned_products").doc(doc.id).update({
                notifiedDates: FieldValue.arrayUnion(expiryString),
              })
              db.collection("notifications").add({
                title: "⏳ FreshTrack Reminder",
                body: `Product "${product.name}" expires on ${expiryString}`,
                time: FieldValue.serverTimestamp(),
                status:"Unseen",
                userId:userId
              });
            }
            )
            .catch((error) =>
              db.collection("notification_errors").add({
                productId: doc.id,
                error: error.message,
                time: FieldValue.serverTimestamp(),
              })
            )
        );
      }
    }

    await Promise.all(promises);
    console.log(`🎯 Total notifications attempted: ${promises.length}`);
    return null;

  }
);
