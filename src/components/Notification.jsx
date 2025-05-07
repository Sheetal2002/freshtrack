import React, { useEffect, useState } from "react";
import { Container, Card, Badge, Spinner, Alert } from "react-bootstrap";
import { getFirestore, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    console.log(user.uid);
    if (!user) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("time", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotifications(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load notifications.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4">🔔 Notifications</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {notifications.map((notif) => (
        <Card key={notif.id} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>
              {notif.title}{" "}
              {notif.status === "Unseen" && (
                <Badge bg="warning" text="dark">
                  New
                </Badge>
              )}
            </Card.Title>
            <Card.Text>{notif.body}</Card.Text>
            <small className="text-muted">
              {notif.time?.toDate ? format(notif.time.toDate(), "PPpp") : ""}
            </small>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default Notification;
