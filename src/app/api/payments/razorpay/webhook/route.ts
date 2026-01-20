import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/services/razorpay.service';
import { updateOrderStatus, getOrder } from '@/services/firestore.service.server';

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId; // Store orderId in notes when creating order

      if (orderId) {
        const order = await getOrder(orderId);
        if (order) {
          await updateOrderStatus(orderId, {
            status: order.status, // Keep existing status
            paymentStatus: 'paid',
            adminNote: `Razorpay Payment ID: ${payment.id}`,
          });
        }
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (orderId) {
        const order = await getOrder(orderId);
        if (order) {
          await updateOrderStatus(orderId, {
            status: order.status, // Keep existing status
            paymentStatus: 'failed',
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
