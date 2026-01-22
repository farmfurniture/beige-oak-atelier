import { Metadata } from "next";
import Link from "next/link";
import { Truck, Package, RefreshCw, Clock, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Shipping & Returns | FarmsCraft",
    description: "Learn about Farm Industries shipping policies, delivery timelines, and return procedures for all furniture orders.",
};

export default function ShippingReturns() {
    return (
        <div className="min-h-screen bg-background">
            <div className="bg-secondary/20 border-b border-border">
                <div className="container mx-auto px-4 py-12">
                    <h1 className="section-title text-foreground mb-4">
                        Shipping & Returns
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Everything you need to know about delivery and returns for your furniture orders.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Quick Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <Card className="p-6 text-center">
                        <Truck className="h-12 w-12 text-accent mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Pan-India Delivery</h3>
                        <p className="text-muted-foreground text-sm">
                            We deliver to all major cities across India
                        </p>
                    </Card>
                    <Card className="p-6 text-center">
                        <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Delivery Time</h3>
                        <p className="text-muted-foreground text-sm">
                            2-4 weeks for standard items, custom orders may vary
                        </p>
                    </Card>
                    <Card className="p-6 text-center">
                        <RefreshCw className="h-12 w-12 text-accent mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Easy Returns</h3>
                        <p className="text-muted-foreground text-sm">
                            7-day return policy for eligible items
                        </p>
                    </Card>
                </div>

                <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Shipping Policy</h2>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Delivery Areas</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We currently deliver to all major cities and towns across India. For remote locations,
                            additional shipping charges may apply. Please contact us for delivery availability in your area.
                        </p>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Delivery Timeline</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li><strong>Ready Stock Items:</strong> 7-14 business days</li>
                            <li><strong>Made-to-Order Items:</strong> 2-4 weeks</li>
                            <li><strong>Custom Orders:</strong> 4-8 weeks (depending on complexity)</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Delivery times are estimates and may vary based on your location and product availability.
                            You will receive tracking information once your order is shipped.
                        </p>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Shipping Charges</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Shipping charges are calculated based on the product size, weight, and delivery location.
                            The exact shipping cost will be displayed at checkout before payment.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            <strong>Free Shipping:</strong> Available on select items and orders above a certain value.
                            Check product pages for specific offers.
                        </p>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Delivery Process</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Our delivery partner will contact you to schedule a delivery time</li>
                            <li>Furniture will be delivered to your doorstep / ground floor</li>
                            <li>Assembly services are available for select products (additional charges may apply)</li>
                            <li>Please inspect the product upon delivery and report any damage immediately</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Returns Policy</h2>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Return Eligibility</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            We want you to be completely satisfied with your purchase. If you are not happy with your order,
                            you may return it within 7 days of delivery, subject to the following conditions:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                            <li>The product must be unused and in its original packaging</li>
                            <li>The product must not be damaged or altered in any way</li>
                            <li>Custom-made or personalized items are not eligible for return</li>
                            <li>Sale items may have different return conditions</li>
                        </ul>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">How to Return</h3>
                        <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Contact our customer support within 7 days of delivery</li>
                            <li>Provide your order number and reason for return</li>
                            <li>Our team will arrange for pickup from your location</li>
                            <li>Once we receive and inspect the product, we will process your refund</li>
                        </ol>

                        <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Refunds</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Refunds will be processed within 7-10 business days after we receive the returned product.
                            The refund will be credited to your original payment method.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Shipping charges are non-refundable unless the return is due to our error or a defective product.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Damaged or Defective Items</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you receive a damaged or defective item, please contact us immediately (within 24 hours of delivery)
                            with photos of the damage. We will arrange for a replacement or refund at no additional cost to you.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Cancellations</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            You may cancel your order before it has been shipped by contacting our customer support.
                            Once the order is shipped, cancellation is not possible, but you may return the item as per our returns policy.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Custom orders cannot be cancelled once production has begun.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            For any shipping or return related queries, please contact us:
                        </p>
                        <div className="mt-4 p-6 bg-secondary/20 rounded-lg">
                            <p className="text-foreground font-semibold">Farm Industries</p>
                            <p className="text-muted-foreground">
                                Khewat No. 119/16//67/16/15, Sirsi Loharu Road<br />
                                Bhiwani – 127201, Haryana, India
                            </p>
                            <p className="text-muted-foreground mt-2">
                                Phone: +91 8572884333
                            </p>
                            <p className="text-muted-foreground mt-2">
                                Website:{" "}
                                <a href="https://www.farmscraft.com" className="text-accent hover:underline">
                                    www.farmscraft.com
                                </a>
                            </p>
                            <p className="text-muted-foreground mt-2">
                                <Link href="/contact" className="text-accent hover:underline">
                                    Contact Form →
                                </Link>
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
