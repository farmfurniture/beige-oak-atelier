/**
 * Firestore Type Definitions for FarmsCraft E-commerce
 * 
 * These types match the Firestore schema defined in FIRESTORE_SCHEMA.md
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// CART TYPES
// ============================================================================

export interface ProductVariant {
  size?: string;
  color?: string;
  weight?: string;
  [key: string]: string | undefined; // Allow additional variant properties
}

export interface CartItem {
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  price: number;
  imageUrl: string;
  variant?: ProductVariant;
  addedAt: Timestamp;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'failed';

export type PaymentMethod = 
  | 'cod' 
  | 'online' 
  | 'upi' 
  | 'card' 
  | 'wallet';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  price: number;
  imageUrl: string;
  variant?: ProductVariant;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  landmark?: string;
}

export interface ShippingTracking {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Timestamp;
}

export interface OrderTimeline {
  placedAt: Timestamp;
  confirmedAt?: Timestamp | null;
  shippedAt?: Timestamp | null;
  deliveredAt?: Timestamp | null;
  cancelledAt?: Timestamp | null;
}

export interface OrderNotes {
  customerNote?: string;
  adminNote?: string;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  pricing: OrderPricing;
  couponCode?: string | null;
  shippingAddress: Address;
  billingAddress: Address;
  tracking?: ShippingTracking;
  timeline: OrderTimeline;
  notes?: OrderNotes;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating a new cart (without timestamps)
 */
export type CreateCartInput = Omit<Cart, 'createdAt' | 'updatedAt'>;

/**
 * Type for updating cart items
 */
export type UpdateCartInput = Partial<Omit<Cart, 'userId' | 'createdAt'>>;

/**
 * Type for creating a new order (without auto-generated fields)
 */
export type CreateOrderInput = Omit<Order, 'orderId' | 'orderNumber' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating order status
 */
export interface UpdateOrderStatusInput {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  tracking?: Partial<ShippingTracking>;
  adminNote?: string;
}

/**
 * Type for order filters (for queries)
 */
export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  orderNumber?: string;
}

// ============================================================================
// FRONTEND DISPLAY TYPES
// ============================================================================

/**
 * Simplified cart item for display (with Date instead of Timestamp)
 */
export interface CartItemDisplay extends Omit<CartItem, 'addedAt'> {
  addedAt: Date;
}

/**
 * Simplified cart for display
 */
export interface CartDisplay extends Omit<Cart, 'items' | 'createdAt' | 'updatedAt'> {
  items: CartItemDisplay[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simplified order for display
 */
export interface OrderDisplay extends Omit<Order, 'timeline' | 'tracking' | 'createdAt' | 'updatedAt'> {
  timeline: {
    placedAt: Date;
    confirmedAt?: Date | null;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
    cancelledAt?: Date | null;
  };
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Firestore Cart to CartDisplay
 */
export function cartToDisplay(cart: Cart): CartDisplay {
  return {
    ...cart,
    items: cart.items.map(item => ({
      ...item,
      addedAt: item.addedAt.toDate(),
    })),
    createdAt: cart.createdAt.toDate(),
    updatedAt: cart.updatedAt.toDate(),
  };
}

/**
 * Convert Firestore Order to OrderDisplay
 */
export function orderToDisplay(order: Order): OrderDisplay {
  return {
    ...order,
    timeline: {
      placedAt: order.timeline.placedAt.toDate(),
      confirmedAt: order.timeline.confirmedAt?.toDate() || null,
      shippedAt: order.timeline.shippedAt?.toDate() || null,
      deliveredAt: order.timeline.deliveredAt?.toDate() || null,
      cancelledAt: order.timeline.cancelledAt?.toDate() || null,
    },
    tracking: order.tracking ? {
      carrier: order.tracking.carrier,
      trackingNumber: order.tracking.trackingNumber,
      trackingUrl: order.tracking.trackingUrl,
      estimatedDelivery: order.tracking.estimatedDelivery?.toDate(),
    } : undefined,
    createdAt: order.createdAt.toDate(),
    updatedAt: order.updatedAt.toDate(),
  };
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${year}-${timestamp}${random}`;
}

/**
 * Calculate pricing from cart items
 */
export function calculatePricing(
  items: CartItem[] | OrderItem[],
  shippingCost: number = 50,
  couponDiscount: number = 0
): OrderPricing {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const discount = couponDiscount;
  const total = subtotal + tax + shippingCost - discount;
  
  return {
    subtotal,
    tax,
    shippingCost,
    discount,
    total,
  };
}

/**
 * Get order status color for UI
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    failed: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Get payment status color for UI
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pending: 'yellow',
    paid: 'green',
    failed: 'red',
    refunded: 'orange',
  };
  return colors[status] || 'gray';
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: OrderStatus): string {
  const formatted: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };
  return formatted[status] || status;
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: PaymentStatus): string {
  const formatted: Record<PaymentStatus, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return formatted[status] || status;
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(order: Order): boolean {
  return ['pending', 'confirmed', 'processing'].includes(order.status);
}

/**
 * Check if order status can be updated to new status
 */
export function canUpdateOrderStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled', 'failed'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'failed'],
    delivered: [],
    cancelled: [],
    failed: ['pending'],
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
