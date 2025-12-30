import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { validateAdminSession } from '@/lib/admin-auth';

/**
 * GET /api/admin/products
 * Fetch all products for admin dashboard
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

        // Fetch products from Firestore using Admin SDK
        const productsSnapshot = await adminDb
            .collection('products')
            .orderBy('createdAt', 'desc')
            .get();

        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamps to ISO strings
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));

        return NextResponse.json({ products }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/products
 * Update product
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
        const { productId, ...updates } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'Missing required field: productId' },
                { status: 400 }
            );
        }

        // Update product in Firestore
        const productRef = adminDb.collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        await productRef.update({
            ...updates,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/products
 * Create new product
 */
export async function POST(request: NextRequest) {
    try {
        // Check admin session
        if (!validateAdminSession(request)) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid admin session' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Create product in Firestore
        const productRef = adminDb.collection('products').doc();

        await productRef.set({
            ...body,
            id: productRef.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            productId: productRef.id
        }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/products
 * Delete product
 */
export async function DELETE(request: NextRequest) {
    try {
        // Check admin session
        if (!validateAdminSession(request)) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid admin session' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Missing required parameter: productId' },
                { status: 400 }
            );
        }

        // Delete product from Firestore
        const productRef = adminDb.collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        await productRef.delete();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
