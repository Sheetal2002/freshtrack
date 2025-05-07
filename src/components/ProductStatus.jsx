
import React from 'react';

const ProductStatus = ({ expiryDate }) => {
  if (!expiryDate || !expiryDate.toDate) return <span>Unknown</span>; //  Handle missing expiry dates

  const now = new Date();
  const expiry = expiryDate.toDate();
  const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) return <span className="badge bg-danger">Expired</span>; //  Expired
  if (daysRemaining>0 && daysRemaining < 7) return <span className="badge bg-warning">Expiring Soon</span>; //  Expiring Soon
  return <span className="badge bg-success">Fresh</span>; //  Fresh
};

export default ProductStatus;
