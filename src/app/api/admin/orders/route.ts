import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { validateAdminSession } from '@/lib/admin-auth';

// Force dynamic rendering since this route uses cookies for admin session validation
export const dynamic = 'force-dynamic';
/**
 * GET /api/admin/orders
 * Fetch all orders for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin session
    if (!validateAdminSession(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid admin session' },
        { status: 401 }
      );
    }

    // Fetch orders from Firestore using Admin SDK
    const ordersSnapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      orderId: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      timeline: {
        placedAt: doc.data().timeline?.placedAt?.toDate?.()?.toISOString() || null,
        confirmedAt: doc.data().timeline?.confirmedAt?.toDate?.()?.toISOString() || null,
        shippedAt: doc.data().timeline?.shippedAt?.toDate?.()?.toISOString() || null,
        deliveredAt: doc.data().timeline?.deliveredAt?.toDate?.()?.toISOString() || null,
        cancelledAt: doc.data().timeline?.cancelledAt?.toDate?.()?.toISOString() || null,
      }
    }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Update order status
 */
export async function PATCH(request: NextRequest) {
  try {
    // Check admin session
    if (!validateAdminSession(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid admin session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, status, paymentStatus, tracking, adminNote } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, status' },
        { status: 400 }
      );
    }

    // Update order in Firestore
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    if (tracking) {
      updates.tracking = tracking;
    }

    if (adminNote) {
      updates['notes.adminNote'] = adminNote;
    }

    // Update timeline based on status
    const timeline: Record<string, Date> = {};
    const now = new Date();

    switch (status) {
      case 'confirmed':
        timeline['timeline.confirmedAt'] = now;
        break;
      case 'shipped':
        timeline['timeline.shippedAt'] = now;
        break;
      case 'delivered':
        timeline['timeline.deliveredAt'] = now;
        break;
      case 'cancelled':
        timeline['timeline.cancelledAt'] = now;
        break;
    }

    await orderRef.update({ ...updates, ...timeline });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
