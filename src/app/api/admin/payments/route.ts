import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { validateAdminSession } from '@/lib/admin-auth';
import type { PaymentRecord, PaymentStatus } from '@/types/firestore';

// Force dynamic rendering since this route uses cookies for admin session validation
export const dynamic = 'force-dynamic';

type TransactionEntry = {
  id: string;
  customer: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Refunded';
  processedAt: string;
  gateway: 'Razorpay';
  reference: string;
};

function mapPaymentStatusToDisplay(status: PaymentStatus): TransactionEntry['status'] {
  switch (status) {
    case 'paid':
      return 'Completed';
    case 'refunded':
      return 'Refunded';
    case 'pending':
    case 'failed':
    default:
      return 'Pending';
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    if (!validateAdminSession(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid admin session' },
        { status: 401 }
      );
    }

    // Fetch latest payments from Firestore using Admin SDK
    const snapshot = await adminDb
      .collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const transactions: TransactionEntry[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data() as any as PaymentRecord;

      const amount =
        typeof data.amount === 'number'
          ? data.amount
          : Number(data.amount ?? 0);

      const createdAtAdmin = (data as any).createdAt;
      const createdAtIso =
        createdAtAdmin && typeof createdAtAdmin.toDate === 'function'
          ? createdAtAdmin.toDate().toISOString()
          : new Date().toISOString();

      // Optional: try to get customer name from orders collection
      let customer = '';
      if (data.orderId) {
        try {
          const orderDoc = await adminDb.collection('orders').doc(data.orderId).get();
          const orderData = orderDoc.data();
          if (orderData) {
            customer =
              (orderData.shippingAddress?.fullName as string | undefined) ||
              (orderData.userEmail as string | undefined) ||
              data.orderId;
          }
        } catch {
          customer = data.orderId;
        }
      }

      transactions.push({
        id: data.paymentId,
        customer,
        amount,
        status: mapPaymentStatusToDisplay(data.status),
        processedAt: createdAtIso,
        gateway: 'Razorpay',
        reference: data.paymentId,
      });
    }

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch payments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

