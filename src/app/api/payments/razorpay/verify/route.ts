import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, getPaymentDetails } from '@/services/razorpay.service';
import { updateOrderStatus, getOrder } from '@/services/firestore.service.server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    // Update order in Firestore if orderId is provided
    if (orderId) {
      const order = await getOrder(orderId);
      if (order) {
        await updateOrderStatus(orderId, {
          status: order.status, // Keep existing status
          paymentStatus: paymentDetails.status === 'captured' ? 'paid' : 'failed',
          adminNote: `Razorpay Payment ID: ${razorpay_payment_id}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: paymentDetails.status,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
