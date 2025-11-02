export type TrendDirection = "up" | "down" | "steady";

export type SalesMetric = {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: TrendDirection;
  sparkline: number[];
};

export type RevenueOrderPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type OrderStatusSummary = {
  id: string;
  label: string;
  count: number;
  change: number;
  trend: TrendDirection;
};

export type OrderEntry = {
  id: string;
  customer: string;
  channel: "Showroom" | "Online" | "Wellness Partners";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Delayed";
  fulfillmentEta: string;
  total: number;
  orderedAt: string;
  note?: string;
};

export type CustomerRetentionMetric = {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: TrendDirection;
};

export type CustomerSegment = {
  id: string;
  title: string;
  customers: number;
  revenueShare: number;
  narrative: string;
};

export type SupportQueueSummary = {
  id: string;
  label: string;
  count: number;
  slaMinutes: number;
};

export type SupportTicket = {
  id: string;
  customer: string;
  topic: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Awaiting Customer" | "Resolved";
  submittedAt: string;
};

export type LowStockAlert = {
  sku: string;
  product: string;
  stock: number;
  threshold: number;
};

export type TopSeller = {
  sku: string;
  product: string;
  revenue: number;
  unitsSold: number;
  trend: TrendDirection;
};

export type InventorySku = {
  sku: string;
  product: string;
  status: "Healthy" | "Low" | "Reorder";
  stock: number;
  incoming?: number;
};

export type TrafficSeriesPoint = {
  date: string;
  visitors: number;
  conversions: number;
};

export type ConversionMetric = {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: TrendDirection;
};

export type TransactionEntry = {
  id: string;
  customer: string;
  amount: number;
  status: "Completed" | "Pending" | "Refunded";
  processedAt: string;
  gateway: "Stripe" | "Square" | "PayPal";
  reference: string;
};

export type ShippingMethod = {
  id: string;
  name: string;
  averageDeliveryDays: number;
  active: boolean;
  serviceLevel: "Standard" | "Premium" | "White-Glove";
};

export type DeliveryFeedEntry = {
  id: string;
  orderId: string;
  status: "Out for Delivery" | "Delivered" | "Delayed" | "Preparing";
  timestamp: string;
  summary: string;
};

const salesMetrics: SalesMetric[] = [
  {
    id: "today",
    label: "Today",
    value: 18420,
    change: 12.4,
    trend: "up",
    sparkline: [220, 260, 310, 280, 360, 410, 395],
  },
  {
    id: "last7",
    label: "Last 7 Days",
    value: 126480,
    change: 6.1,
    trend: "up",
    sparkline: [1420, 1320, 1560, 1610, 1700, 1820, 1940],
  },
  {
    id: "last30",
    label: "Last 30 Days",
    value: 498720,
    change: -2.3,
    trend: "down",
    sparkline: [6100, 6420, 5980, 5720, 5900, 6150, 6020, 6300],
  },
];

const revenueOrderSeries: RevenueOrderPoint[] = [
  { date: "Mon", revenue: 16800, orders: 32 },
  { date: "Tue", revenue: 15540, orders: 28 },
  { date: "Wed", revenue: 18960, orders: 36 },
  { date: "Thu", revenue: 17610, orders: 34 },
  { date: "Fri", revenue: 20540, orders: 40 },
  { date: "Sat", revenue: 22780, orders: 44 },
  { date: "Sun", revenue: 21220, orders: 38 },
];

const orderStatusSummary: OrderStatusSummary[] = [
  {
    id: "pending",
    label: "Pending",
    count: 18,
    change: -4.8,
    trend: "down",
  },
  {
    id: "processing",
    label: "Processing",
    count: 42,
    change: 11.2,
    trend: "up",
  },
  {
    id: "shipped",
    label: "Shipped",
    count: 28,
    change: 3.1,
    trend: "up",
  },
  {
    id: "delivered",
    label: "Delivered",
    count: 65,
    change: 8.4,
    trend: "up",
  },
];

const orders: OrderEntry[] = [
  {
    id: "ORD-2401",
    customer: "Evelyn Hart",
    channel: "Online",
    status: "Processing",
    fulfillmentEta: "Arrives Oct 24",
    total: 6240,
    orderedAt: "2025-10-20T09:15:00Z",
    note: "Wellness retreat upgrade package",
  },
  {
    id: "ORD-2402",
    customer: "Luca Moretti",
    channel: "Showroom",
    status: "Shipped",
    fulfillmentEta: "Arrives Oct 22",
    total: 8420,
    orderedAt: "2025-10-19T17:45:00Z",
  },
  {
    id: "ORD-2403",
    customer: "Nia Holloway",
    channel: "Wellness Partners",
    status: "Pending",
    fulfillmentEta: "Awaiting confirmation",
    total: 4120,
    orderedAt: "2025-10-19T12:30:00Z",
    note: "Sleep coaching bundle",
  },
  {
    id: "ORD-2404",
    customer: "Ananya Kapoor",
    channel: "Online",
    status: "Delivered",
    fulfillmentEta: "Delivered Oct 18",
    total: 7350,
    orderedAt: "2025-10-17T08:10:00Z",
  },
  {
    id: "ORD-2405",
    customer: "Mason Lavigne",
    channel: "Showroom",
    status: "Delayed",
    fulfillmentEta: "Revised ETA Oct 26",
    total: 9580,
    orderedAt: "2025-10-16T19:05:00Z",
    note: "White-glove reschedule requested",
  },
];

const retentionMetrics: CustomerRetentionMetric[] = [
  {
    id: "repeatRate",
    label: "Repeat Purchase Rate",
    value: 47,
    change: 5.2,
    trend: "up",
  },
  {
    id: "membershipRetention",
    label: "Wellness Membership Retained",
    value: 82,
    change: -1.4,
    trend: "down",
  },
  {
    id: "referralRate",
    label: "Referral Conversion",
    value: 29,
    change: 3.8,
    trend: "up",
  },
];

const customerSegments: CustomerSegment[] = [
  {
    id: "loyal",
    title: "Loyal Collective",
    customers: 482,
    revenueShare: 56,
    narrative: "Advisory members booking seasonal sleep sanctuary refreshes.",
  },
  {
    id: "new",
    title: "New Arrivals",
    customers: 163,
    revenueShare: 22,
    narrative: "First-time mattress buyers exploring holistic sleep rituals.",
  },
  {
    id: "inactive",
    title: "Inactive",
    customers: 94,
    revenueShare: 8,
    narrative: "Due for re-engagement with curated bedding bundles.",
  },
];

const supportQueueSummary: SupportQueueSummary[] = [
  { id: "open", label: "Open Tickets", count: 12, slaMinutes: 45 },
  { id: "inProgress", label: "In Progress", count: 7, slaMinutes: 30 },
  { id: "vip", label: "VIP Escalations", count: 2, slaMinutes: 15 },
];

const supportTickets: SupportTicket[] = [
  {
    id: "SUP-1893",
    customer: "Aiko Chen",
    topic: "Adjustable base calibration",
    priority: "High",
    status: "In Progress",
    submittedAt: "2025-10-20T14:22:00Z",
  },
  {
    id: "SUP-1894",
    customer: "Diego Santoro",
    topic: "Wellness concierge scheduling",
    priority: "Medium",
    status: "Open",
    submittedAt: "2025-10-20T11:05:00Z",
  },
  {
    id: "SUP-1895",
    customer: "Sahana Rao",
    topic: "Meditation headboard lighting dimmer",
    priority: "Low",
    status: "Awaiting Customer",
    submittedAt: "2025-10-19T19:40:00Z",
  },
  {
    id: "SUP-1896",
    customer: "Callum Reid",
    topic: "White-glove delivery window change",
    priority: "Urgent",
    status: "Open",
    submittedAt: "2025-10-19T09:50:00Z",
  },
  {
    id: "SUP-1897",
    customer: "Priya Desai",
    topic: "Thermal topper personalization",
    priority: "Medium",
    status: "Resolved",
    submittedAt: "2025-10-18T21:30:00Z",
  },
];

const lowStockAlerts: LowStockAlert[] = [
  {
    sku: "BOA-RESTORE-QUEEN",
    product: "Restore Hybrid Mattress — Queen",
    stock: 14,
    threshold: 20,
  },
  {
    sku: "BOA-AIRWEAVE-TOPPER",
    product: "AirWeave Cooling Topper",
    stock: 9,
    threshold: 15,
  },
];

const topSellers: TopSeller[] = [
  {
    sku: "BOA-ALIGN-KING",
    product: "Align Pro Mattress — King",
    revenue: 192480,
    unitsSold: 48,
    trend: "up",
  },
  {
    sku: "BOA-TRANQUIL-SET",
    product: "Tranquil Bedroom System",
    revenue: 146320,
    unitsSold: 26,
    trend: "up",
  },
  {
    sku: "BOA-LUMEN-LIGHTS",
    product: "Lumen Guided Ambience Lamps",
    revenue: 68450,
    unitsSold: 92,
    trend: "steady",
  },
];

const inventoryBySku: InventorySku[] = [
  {
    sku: "BOA-ALIGN-FULL",
    product: "Align Pro Mattress — Full",
    status: "Healthy",
    stock: 124,
  },
  {
    sku: "BOA-ALIGN-TWIN",
    product: "Align Pro Mattress — Twin XL",
    status: "Low",
    stock: 32,
    incoming: 80,
  },
  {
    sku: "BOA-HARMONY-SHEET",
    product: "Harmony Temperature Sheet Set",
    status: "Reorder",
    stock: 18,
    incoming: 120,
  },
  {
    sku: "BOA-BREATHE-PILLOW",
    product: "Breathe Align Pillow",
    status: "Healthy",
    stock: 210,
  },
];

const trafficSeries: TrafficSeriesPoint[] = [
  { date: "Oct 15", visitors: 3840, conversions: 212 },
  { date: "Oct 16", visitors: 4010, conversions: 224 },
  { date: "Oct 17", visitors: 4280, conversions: 238 },
  { date: "Oct 18", visitors: 4720, conversions: 256 },
  { date: "Oct 19", visitors: 4890, conversions: 244 },
  { date: "Oct 20", visitors: 5120, conversions: 268 },
  { date: "Oct 21", visitors: 5430, conversions: 279 },
];

const conversionMetrics: ConversionMetric[] = [
  {
    id: "trafficToCart",
    label: "Visitor → Cart",
    value: 4.8,
    change: 0.6,
    trend: "up",
  },
  {
    id: "cartToCheckout",
    label: "Cart → Checkout",
    value: 42.5,
    change: 1.2,
    trend: "up",
  },
  {
    id: "checkoutToPurchase",
    label: "Checkout → Purchase",
    value: 68.3,
    change: -0.9,
    trend: "down",
  },
];

const transactions: TransactionEntry[] = [
  {
    id: "TX-4821",
    customer: "Evelyn Hart",
    amount: 6240,
    status: "Completed",
    processedAt: "2025-10-20T09:18:00Z",
    gateway: "Stripe",
    reference: "pi_3NXf8aSg1",
  },
  {
    id: "TX-4822",
    customer: "Luca Moretti",
    amount: 8420,
    status: "Pending",
    processedAt: "2025-10-19T17:49:00Z",
    gateway: "Square",
    reference: "sq_9ab21fd",
  },
  {
    id: "TX-4823",
    customer: "Nia Holloway",
    amount: 4120,
    status: "Completed",
    processedAt: "2025-10-19T12:36:00Z",
    gateway: "Stripe",
    reference: "pi_3NXc4lBh2",
  },
  {
    id: "TX-4824",
    customer: "Ananya Kapoor",
    amount: 7350,
    status: "Refunded",
    processedAt: "2025-10-18T08:18:00Z",
    gateway: "PayPal",
    reference: "pp_7ff643",
  },
  {
    id: "TX-4825",
    customer: "Mason Lavigne",
    amount: 9580,
    status: "Pending",
    processedAt: "2025-10-16T19:11:00Z",
    gateway: "Stripe",
    reference: "pi_3NWy1kPr4",
  },
];

const shippingMethods: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard",
    averageDeliveryDays: 7,
    active: true,
    serviceLevel: "Standard",
  },
  {
    id: "premium",
    name: "Premium",
    averageDeliveryDays: 4,
    active: true,
    serviceLevel: "Premium",
  },
  {
    id: "whiteGlove",
    name: "White-Glove Wellness Setup",
    averageDeliveryDays: 3,
    active: true,
    serviceLevel: "White-Glove",
  },
  {
    id: "international",
    name: "International Concierge",
    averageDeliveryDays: 12,
    active: false,
    serviceLevel: "Premium",
  },
];

const deliveryFeed: DeliveryFeedEntry[] = [
  {
    id: "DF-901",
    orderId: "ORD-2405",
    status: "Delayed",
    timestamp: "2025-10-20T13:05:00Z",
    summary: "Logistics team coordinating secondary carrier for Bali showroom.",
  },
  {
    id: "DF-902",
    orderId: "ORD-2402",
    status: "Out for Delivery",
    timestamp: "2025-10-20T07:42:00Z",
    summary: "Wellness crew en route for white-glove assembly.",
  },
  {
    id: "DF-903",
    orderId: "ORD-2401",
    status: "Preparing",
    timestamp: "2025-10-20T05:31:00Z",
    summary: "Custom-scent aromatherapy kit added to order.",
  },
  {
    id: "DF-904",
    orderId: "ORD-2397",
    status: "Delivered",
    timestamp: "2025-10-19T18:25:00Z",
    summary: "Completed with guided sleep programming activation.",
  },
];

export function getSalesOverview() {
  return {
    metrics: salesMetrics,
    revenueSeries: revenueOrderSeries,
  };
}

export function getOrders() {
  return {
    summary: orderStatusSummary,
    entries: orders,
  };
}

export function getCustomerInsights() {
  return {
    retention: retentionMetrics,
    segments: customerSegments,
    supportQueue: supportQueueSummary,
    tickets: supportTickets,
  };
}

export function getProductIntelligence() {
  return {
    lowStock: lowStockAlerts,
    topSellers,
    inventory: inventoryBySku,
  };
}

export function getAnalyticsInsights() {
  return {
    trafficSeries,
    conversionMetrics,
  };
}

export function getPaymentsData() {
  return {
    transactions,
  };
}

export function getShippingData() {
  return {
    methods: shippingMethods,
    deliveryFeed,
  };
}

export function getAdminDashboardData() {
  return {
    sales: getSalesOverview(),
    orders: getOrders(),
    customers: getCustomerInsights(),
    products: getProductIntelligence(),
    analytics: getAnalyticsInsights(),
    payments: getPaymentsData(),
    shipping: getShippingData(),
  };
}

export const adminService = {
  getSalesOverview,
  getOrders,
  getCustomerInsights,
  getProductIntelligence,
  getAnalyticsInsights,
  getPaymentsData,
  getShippingData,
  getAdminDashboardData,
} as const;
