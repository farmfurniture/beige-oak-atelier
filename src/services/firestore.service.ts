/**
 * Firestore Service Functions for Cart and Order Management
 * 
 * This file contains all the database operations for carts and orders.
 * Import these functions in your components/pages to interact with Firestore.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    serverTimestamp,
    writeBatch,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase'; // Firebase config
import {
    Cart,
    Order,
    CartItem,
    OrderItem,
    CreateOrderInput,
    UpdateOrderStatusInput,
    OrderFilters,
    generateOrderNumber,
    calculatePricing,
    OrderStatus,
    PaymentStatus,
} from '@/types/firestore';

// ============================================================================
// CART OPERATIONS
// ============================================================================

/**
 * Get user's cart
 */
export async function getCart(userId: string): Promise<Cart | null> {
    try {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            return cartSnap.data() as Cart;
        }
        return null;
    } catch (error) {
        console.error('Error getting cart:', error);
        throw error;
    }
}

/**
 * Create or update cart
 */
export async function saveCart(userId: string, items: CartItem[], couponCode?: string): Promise<void> {
    try {
        const pricing = calculatePricing(items, 50, 0); // TODO: Calculate actual shipping and discount

        const cartData: Cart = {
            userId,
            items,
            ...pricing,
            couponCode: couponCode || null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const cartRef = doc(db, 'carts', userId);
        await setDoc(cartRef, cartData, { merge: true });
    } catch (error) {
        console.error('Error saving cart:', error);
        throw error;
    }
}

/**
 * Add item to cart
 */
export async function addToCart(
    userId: string,
    item: Omit<CartItem, 'addedAt'>
): Promise<void> {
    try {
        const cart = await getCart(userId);
        const newItem: CartItem = {
            ...item,
            addedAt: Timestamp.now(),
        };

        if (cart) {
            // Check if item already exists
            const existingItemIndex = cart.items.findIndex(
                (i) => i.productId === item.productId &&
                    JSON.stringify(i.variant) === JSON.stringify(item.variant)
            );

            if (existingItemIndex >= 0) {
                // Update quantity
                cart.items[existingItemIndex].quantity += item.quantity;
            } else {
                // Add new item
                cart.items.push(newItem);
            }

            await saveCart(userId, cart.items, cart.couponCode || undefined);
        } else {
            // Create new cart
            await saveCart(userId, [newItem]);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
    variant?: any
): Promise<void> {
    try {
        const cart = await getCart(userId);
        if (!cart) throw new Error('Cart not found');

        const itemIndex = cart.items.findIndex(
            (i) => i.productId === productId &&
                JSON.stringify(i.variant) === JSON.stringify(variant)
        );

        if (itemIndex >= 0) {
            if (quantity <= 0) {
                // Remove item
                cart.items.splice(itemIndex, 1);
            } else {
                // Update quantity
                cart.items[itemIndex].quantity = quantity;
            }

            await saveCart(userId, cart.items, cart.couponCode || undefined);
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
    userId: string,
    productId: string,
    variant?: any
): Promise<void> {
    try {
        await updateCartItemQuantity(userId, productId, 0, variant);
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
}

/**
 * Clear cart
 */
export async function clearCart(userId: string): Promise<void> {
    try {
        const cartRef = doc(db, 'carts', userId);
        await deleteDoc(cartRef);
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
}

/**
 * Apply coupon to cart
 */
export async function applyCoupon(userId: string, couponCode: string): Promise<void> {
    try {
        const cart = await getCart(userId);
        if (!cart) throw new Error('Cart not found');

        // TODO: Validate coupon and calculate discount
        await saveCart(userId, cart.items, couponCode);
    } catch (error) {
        console.error('Error applying coupon:', error);
        throw error;
    }
}

// ============================================================================
// ORDER OPERATIONS
// ============================================================================

/**
 * Create new order from cart
 */
export async function createOrder(orderInput: CreateOrderInput): Promise<string> {
    try {
        const ordersRef = collection(db, 'orders');
        const newOrderRef = doc(ordersRef);

        const order: Order = {
            ...orderInput,
            orderId: newOrderRef.id,
            orderNumber: generateOrderNumber(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await setDoc(newOrderRef, order);

        // Clear user's cart after order creation
        await clearCart(orderInput.userId);

        return newOrderRef.id;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
            return orderSnap.data() as Order;
        }
        return null;
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('orderNumber', '==', orderNumber), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as Order;
        }
        return null;
    } catch (error) {
        console.error('Error getting order by number:', error);
        throw error;
    }
}

/**
 * Get user's orders
 */
export async function getUserOrders(
    userId: string,
    limitCount: number = 50
): Promise<Order[]> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error getting user orders:', error);
        throw error;
    }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
        const ordersRef = collection(db, 'orders');
        const constraints: QueryConstraint[] = [];

        if (filters?.userId) {
            constraints.push(where('userId', '==', filters.userId));
        }

        if (filters?.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (filters?.paymentStatus) {
            constraints.push(where('paymentStatus', '==', filters.paymentStatus));
        }

        if (filters?.orderNumber) {
            constraints.push(where('orderNumber', '==', filters.orderNumber));
        }

        // Always order by createdAt
        constraints.push(orderBy('createdAt', 'desc'));

        const q = query(ordersRef, ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error getting all orders:', error);
        throw error;
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
    orderId: string,
    statusUpdate: UpdateOrderStatusInput
): Promise<void> {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const order = await getOrder(orderId);

        if (!order) throw new Error('Order not found');

        const updates: Partial<Order> = {
            status: statusUpdate.status,
            updatedAt: Timestamp.now(),
        };

        // Update payment status if provided
        if (statusUpdate.paymentStatus) {
            updates.paymentStatus = statusUpdate.paymentStatus;
        }

        // Update tracking if provided
        if (statusUpdate.tracking) {
            updates.tracking = {
                ...order.tracking,
                ...statusUpdate.tracking,
            };
        }

        // Update timeline based on status
        const timeline = { ...order.timeline };
        const now = Timestamp.now();

        switch (statusUpdate.status) {
            case 'confirmed':
                timeline.confirmedAt = now;
                break;
            case 'shipped':
                timeline.shippedAt = now;
                break;
            case 'delivered':
                timeline.deliveredAt = now;
                // Auto-update payment status for COD
                if (order.paymentMethod === 'cod') {
                    updates.paymentStatus = 'paid';
                }
                break;
            case 'cancelled':
                timeline.cancelledAt = now;
                break;
        }

        updates.timeline = timeline;

        // Update admin notes if provided
        if (statusUpdate.adminNote) {
            updates.notes = {
                ...order.notes,
                adminNote: statusUpdate.adminNote,
            };
        }

        await updateDoc(orderRef, updates);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
        await updateOrderStatus(orderId, {
            status: 'cancelled',
            adminNote: reason,
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
}

/**
 * Update order tracking
 */
export async function updateOrderTracking(
    orderId: string,
    tracking: {
        carrier: string;
        trackingNumber: string;
        trackingUrl?: string;
        estimatedDelivery?: Date;
    }
): Promise<void> {
    try {
        const orderRef = doc(db, 'orders', orderId);

        await updateDoc(orderRef, {
            tracking: {
                ...tracking,
                estimatedDelivery: tracking.estimatedDelivery
                    ? Timestamp.fromDate(tracking.estimatedDelivery)
                    : undefined,
            },
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating order tracking:', error);
        throw error;
    }
}

/**
 * Get orders by status (admin)
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('status', '==', status),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error getting orders by status:', error);
        throw error;
    }
}

/**
 * Get pending orders (admin)
 */
export async function getPendingOrders(): Promise<Order[]> {
    return getOrdersByStatus('pending');
}

/**
 * Bulk update order statuses (admin)
 */
export async function bulkUpdateOrderStatus(
    orderIds: string[],
    status: OrderStatus
): Promise<void> {
    try {
        const batch = writeBatch(db);

        for (const orderId of orderIds) {
            const orderRef = doc(db, 'orders', orderId);
            batch.update(orderRef, {
                status,
                updatedAt: serverTimestamp(),
            });
        }

        await batch.commit();
    } catch (error) {
        console.error('Error bulk updating orders:', error);
        throw error;
    }
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get order statistics (admin)
 */
export async function getOrderStatistics(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    failed: number;
    totalRevenue: number;
}> {
    try {
        const ordersRef = collection(db, 'orders');
        const querySnapshot = await getDocs(ordersRef);

        const stats = {
            total: 0,
            pending: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            failed: 0,
            totalRevenue: 0,
        };

        querySnapshot.forEach((doc) => {
            const order = doc.data() as Order;
            stats.total++;
            stats[order.status]++;

            if (order.paymentStatus === 'paid') {
                stats.totalRevenue += order.pricing.total;
            }
        });

        return stats;
    } catch (error) {
        console.error('Error getting order statistics:', error);
        throw error;
    }
}

/**
 * Get recent orders (admin dashboard)
 */
export async function getRecentOrders(limitCount: number = 10): Promise<Order[]> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data() as Order);
    } catch (error) {
        console.error('Error getting recent orders:', error);
        throw error;
    }
}
