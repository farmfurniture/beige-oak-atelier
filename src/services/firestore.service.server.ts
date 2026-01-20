/**
 * Server-side Firestore Service Functions
 * 
 * This file contains server-side database operations using Firebase Admin SDK.
 * Use these functions in API routes (webhooks, server actions, etc.)
 * to bypass Firestore security rules.
 */

import { adminDb } from '@/config/firebase-admin';
import { Timestamp } from 'firebase/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type {
  Order,
  UpdateOrderStatusInput,
  CreatePaymentRecordInput,
} from '@/types/firestore';

/**
 * Get order by ID (server-side, bypasses security rules)
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();

    if (orderDoc.exists) {
      const data = orderDoc.data();
      if (data) {
        // Convert Admin SDK Timestamps to client SDK Timestamps
        const convertTimestamps = (obj: any): any => {
          if (obj === null || obj === undefined) return obj;
          
          // Check if it's an Admin SDK Timestamp
          if (obj.constructor?.name === 'Timestamp' && typeof obj.toMillis === 'function') {
            return Timestamp.fromMillis(obj.toMillis());
          }
          
          if (Array.isArray(obj)) {
            return obj.map(convertTimestamps);
          }
          
          if (typeof obj === 'object') {
            const converted: any = {};
            for (const [key, value] of Object.entries(obj)) {
              converted[key] = convertTimestamps(value);
            }
            return converted;
          }
          
          return obj;
        };

        return convertTimestamps(data) as Order;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

/**
 * Update order status (server-side, bypasses security rules)
 */
export async function updateOrderStatus(
  orderId: string,
  statusUpdate: UpdateOrderStatusInput
): Promise<void> {
  try {
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }

    const order = orderDoc.data() as Order;

    const updates: any = {
      status: statusUpdate.status,
      updatedAt: FieldValue.serverTimestamp(),
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
    const timeline: any = { ...order.timeline };
    const now = FieldValue.serverTimestamp();

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

    await orderRef.update(updates);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Create or update a generic payment record in the `payments` collection.
 * Uses a gateway-agnostic schema with `paymentId`, `orderId`, `gateway`, etc.
 */
export async function upsertPaymentRecord(
  input: CreatePaymentRecordInput & { raw?: any }
): Promise<void> {
  try {
    const paymentRef = adminDb.collection('payments').doc(input.paymentId);
    const existing = await paymentRef.get();

    const now = FieldValue.serverTimestamp();

    const data: any = {
      paymentId: input.paymentId,
      orderId: input.orderId,
      gateway: input.gateway,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
      method: input.method,
      raw: input.raw,
      updatedAt: now,
    };

    if (!existing.exists) {
      data.createdAt = now;
    }

    await paymentRef.set(data, { merge: true });
  } catch (error) {
    console.error('Error upserting payment record:', error);
    throw error;
  }
}
