/**
 * Admin API Service
 * Client-side functions to call admin API routes
 */

import { Order, OrderStatus } from '@/types/firestore';

/**
 * Fetch all orders (admin)
 */
export async function fetchAdminOrders(): Promise<Order[]> {
    try {
        const response = await fetch('/api/admin/orders', {
            method: 'GET',
            credentials: 'include', // Include cookies
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch orders');
        }

        const data = await response.json();

        // Convert ISO strings back to Timestamp-like objects
        return data.orders.map((order: any) => ({
            ...order,
            createdAt: order.createdAt ? { toDate: () => new Date(order.createdAt), toMillis: () => new Date(order.createdAt).getTime() } : null,
            updatedAt: order.updatedAt ? { toDate: () => new Date(order.updatedAt), toMillis: () => new Date(order.updatedAt).getTime() } : null,
            timeline: {
                placedAt: order.timeline?.placedAt ? { toDate: () => new Date(order.timeline.placedAt), toMillis: () => new Date(order.timeline.placedAt).getTime() } : null,
                confirmedAt: order.timeline?.confirmedAt ? { toDate: () => new Date(order.timeline.confirmedAt), toMillis: () => new Date(order.timeline.confirmedAt).getTime() } : null,
                shippedAt: order.timeline?.shippedAt ? { toDate: () => new Date(order.timeline.shippedAt), toMillis: () => new Date(order.timeline.shippedAt).getTime() } : null,
                deliveredAt: order.timeline?.deliveredAt ? { toDate: () => new Date(order.timeline.deliveredAt), toMillis: () => new Date(order.timeline.deliveredAt).getTime() } : null,
                cancelledAt: order.timeline?.cancelledAt ? { toDate: () => new Date(order.timeline.cancelledAt), toMillis: () => new Date(order.timeline.cancelledAt).getTime() } : null,
            }
        }));
    } catch (error: any) {
        console.error('Error fetching admin orders:', error);
        throw error;
    }
}

/**
 * Update order status (admin)
 */
export async function updateAdminOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: string,
    tracking?: any,
    adminNote?: string
): Promise<void> {
    try {
        const response = await fetch('/api/admin/orders', {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
                status,
                paymentStatus,
                tracking,
                adminNote,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update order');
        }
    } catch (error: any) {
        console.error('Error updating admin order:', error);
        throw error;
    }
}

/**
 * Fetch all products (admin)
 */
export async function fetchAdminProducts(): Promise<any[]> {
    try {
        const response = await fetch('/api/admin/products', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch products');
        }

        const data = await response.json();

        // Convert ISO strings back to Date objects
        return data.products.map((product: any) => ({
            ...product,
            createdAt: product.createdAt ? new Date(product.createdAt) : null,
            updatedAt: product.updatedAt ? new Date(product.updatedAt) : null,
        }));
    } catch (error: any) {
        console.error('Error fetching admin products:', error);
        throw error;
    }
}

/**
 * Update product (admin)
 */
export async function updateAdminProduct(productId: string, updates: any): Promise<void> {
    try {
        const response = await fetch('/api/admin/products', {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId,
                ...updates,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update product');
        }
    } catch (error: any) {
        console.error('Error updating admin product:', error);
        throw error;
    }
}

/**
 * Create product (admin)
 */
export async function createAdminProduct(productData: any): Promise<string> {
    try {
        const response = await fetch('/api/admin/products', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create product');
        }

        const data = await response.json();
        return data.productId;
    } catch (error: any) {
        console.error('Error creating admin product:', error);
        throw error;
    }
}

/**
 * Delete product (admin)
 */
export async function deleteAdminProduct(productId: string): Promise<void> {
    try {
        const response = await fetch(`/api/admin/products?productId=${productId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete product');
        }
    } catch (error: any) {
        console.error('Error deleting admin product:', error);
        throw error;
    }
}
