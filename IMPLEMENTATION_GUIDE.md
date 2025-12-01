# Implementation Guide - Cart & Orders

This guide shows you how to use the Firestore schema and service functions in your Next.js app.

## Table of Contents
1. [Setup](#setup)
2. [Cart Implementation](#cart-implementation)
3. [Order Implementation](#order-implementation)
4. [Admin Dashboard](#admin-dashboard)
5. [Security Rules](#security-rules)

---

## Setup

### 1. Ensure Firebase is initialized

Your Firebase config should be in `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 2. Create Firestore Indexes

Go to Firebase Console → Firestore → Indexes and create these composite indexes:

```
Collection: orders
Fields: userId (Ascending), createdAt (Descending)

Collection: orders
Fields: status (Ascending), createdAt (Descending)

Collection: orders
Fields: userId (Ascending), status (Ascending), createdAt (Descending)

Collection: orders
Fields: paymentStatus (Ascending), createdAt (Descending)
```

---

## Cart Implementation

### Example: Product Page - Add to Cart

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Your auth hook
import { addToCart } from '@/services/firestore.service';
import { CartItem } from '@/types/firestore';

export default function ProductPage({ product }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      await addToCart(user.uid, {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        quantity,
        price: product.price,
        imageUrl: product.images[0],
        variant: {
          weight: '1kg', // Example variant
        },
      });
      
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleAddToCart} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### Example: Cart Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getCart, 
  updateCartItemQuantity, 
  removeFromCart 
} from '@/services/firestore.service';
import { Cart, cartToDisplay } from '@/types/firestore';

export default function CartPage() {
  const { user, isLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const cartData = await getCart(user!.uid);
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!user) return;
    
    try {
      await updateCartItemQuantity(user.uid, productId, newQuantity);
      await loadCart(); // Refresh cart
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!user) return;
    
    try {
      await removeFromCart(user.uid, productId);
      await loadCart(); // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) return <div>Loading cart...</div>;
  if (!cart || cart.items.length === 0) return <div>Your cart is empty</div>;

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cart.items.map((item) => (
        <div key={item.productId}>
          <img src={item.imageUrl} alt={item.productName} />
          <h3>{item.productName}</h3>
          <p>₹{item.price}</p>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value))}
            min="1"
          />
          <button onClick={() => handleRemoveItem(item.productId)}>Remove</button>
        </div>
      ))}
      
      <div>
        <p>Subtotal: ₹{cart.subtotal}</p>
        <p>Tax: ₹{cart.tax}</p>
        <p>Shipping: ₹{cart.shippingCost}</p>
        <p>Total: ₹{cart.total}</p>
      </div>
      
      <button onClick={() => router.push('/checkout')}>
        Proceed to Checkout
      </button>
    </div>
  );
}
```

---

## Order Implementation

### Example: Checkout Page - Create Order

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/services/firestore.service';
import { CreateOrderInput, OrderItem } from '@/types/firestore';
import { Timestamp } from 'firebase/firestore';

export default function CheckoutPage({ cart }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    landmark: '',
  });

  const handlePlaceOrder = async () => {
    if (!user || !cart) return;

    setLoading(true);
    try {
      // Convert cart items to order items
      const orderItems: OrderItem[] = cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
        variant: item.variant,
      }));

      const orderInput: CreateOrderInput = {
        userId: user.uid,
        userEmail: user.email || '',
        userPhone: user.phoneNumber || shippingAddress.phone,
        status: 'pending',
        paymentMethod: 'cod', // COD for now
        paymentStatus: 'pending',
        items: orderItems,
        pricing: {
          subtotal: cart.subtotal,
          tax: cart.tax,
          shippingCost: cart.shippingCost,
          discount: cart.discount,
          total: cart.total,
        },
        couponCode: cart.couponCode || null,
        shippingAddress,
        billingAddress: shippingAddress, // Same as shipping for now
        timeline: {
          placedAt: Timestamp.now(),
        },
        notes: {
          customerNote: '', // Add customer notes if needed
        },
      };

      const orderId = await createOrder(orderInput);
      
      // Redirect to order confirmation
      router.push(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      
      {/* Shipping Address Form */}
      <form>
        <input
          type="text"
          placeholder="Full Name"
          value={shippingAddress.fullName}
          onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={shippingAddress.phone}
          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address Line 1"
          value={shippingAddress.addressLine1}
          onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
        />
        {/* Add more fields... */}
      </form>

      {/* Order Summary */}
      <div>
        <h2>Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.productId}>
            <p>{item.productName} x {item.quantity}</p>
            <p>₹{item.price * item.quantity}</p>
          </div>
        ))}
        <p>Total: ₹{cart.total}</p>
      </div>

      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? 'Placing Order...' : 'Place Order (COD)'}
      </button>
    </div>
  );
}
```

### Example: Order Details Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrder } from '@/services/firestore.service';
import { Order, orderToDisplay, formatOrderStatus } from '@/types/firestore';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading order...</div>;
  if (!order) return <div>Order not found</div>;

  const displayOrder = orderToDisplay(order);

  return (
    <div>
      <h1>Order #{order.orderNumber}</h1>
      <p>Status: {formatOrderStatus(order.status)}</p>
      <p>Placed on: {displayOrder.timeline.placedAt.toLocaleDateString()}</p>

      <h2>Items</h2>
      {order.items.map((item) => (
        <div key={item.productId}>
          <img src={item.imageUrl} alt={item.productName} />
          <h3>{item.productName}</h3>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ₹{item.price}</p>
        </div>
      ))}

      <h2>Shipping Address</h2>
      <p>{order.shippingAddress.fullName}</p>
      <p>{order.shippingAddress.addressLine1}</p>
      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}</p>

      <h2>Pricing</h2>
      <p>Subtotal: ₹{order.pricing.subtotal}</p>
      <p>Tax: ₹{order.pricing.tax}</p>
      <p>Shipping: ₹{order.pricing.shippingCost}</p>
      <p>Total: ₹{order.pricing.total}</p>

      {order.tracking && (
        <div>
          <h2>Tracking</h2>
          <p>Carrier: {order.tracking.carrier}</p>
          <p>Tracking Number: {order.tracking.trackingNumber}</p>
          {order.tracking.trackingUrl && (
            <a href={order.tracking.trackingUrl} target="_blank">Track Package</a>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Admin Dashboard

### Example: Admin Orders Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { 
  getAllOrders, 
  updateOrderStatus, 
  getOrderStatistics 
} from '@/services/firestore.service';
import { Order, OrderStatus } from '@/types/firestore';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        getAllOrders(),
        getOrderStatistics(),
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      await loadData(); // Refresh
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Orders Management</h1>

      {/* Statistics */}
      {stats && (
        <div>
          <h2>Statistics</h2>
          <p>Total Orders: {stats.total}</p>
          <p>Pending: {stats.pending}</p>
          <p>Delivered: {stats.delivered}</p>
          <p>Total Revenue: ₹{stats.totalRevenue}</p>
        </div>
      )}

      {/* Orders Table */}
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderNumber}</td>
              <td>{order.userEmail}</td>
              <td>₹{order.pricing.total}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order.orderId, e.target.value as OrderStatus)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>{order.paymentStatus}</td>
              <td>{order.createdAt.toDate().toLocaleDateString()}</td>
              <td>
                <button onClick={() => router.push(`/admin/orders/${order.orderId}`)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Security Rules

Add these to your Firestore Security Rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Carts Collection
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders Collection
    match /orders/{orderId} {
      // Users can read their own orders
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || isAdmin());
      
      // Users can create orders for themselves
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Only admins can update/delete orders
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## Next Steps

1. **Create UI Components**: Build reusable components for cart items, order cards, etc.
2. **Add Real-time Updates**: Use Firestore's `onSnapshot` for real-time cart/order updates
3. **Implement Payment Gateway**: Integrate Razorpay/Stripe for online payments
4. **Add Email Notifications**: Send order confirmation emails using Firebase Functions
5. **Implement Coupon System**: Create a coupons collection and validation logic
6. **Add Order Search**: Implement search functionality for admin dashboard
7. **Create Analytics Dashboard**: Build charts for sales, revenue, etc.
- `FIRESTORE_SCHEMA.md` - Complete schema documentation
- `src/types/firestore.ts` - TypeScript type definitions
- `src/services/firestore.service.ts` - Service functions
