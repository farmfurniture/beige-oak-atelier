import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms & Conditions | Farm Craft",
    description: "Read the terms and conditions for using Farmscraft and purchasing our products.",
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-secondary/20 border-b border-border">
                <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Terms & Conditions
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        These Terms & Conditions define the rules between Farmscraft and its customers.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">

                    <p className="text-muted-foreground leading-relaxed mb-8 text-center">
                        By purchasing or using our products, you agree to these terms.
                    </p>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">1. General Information</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Farmscraft is a factory/company engaged in manufacturing and supplying products. Use of our products or services means you accept these Terms & Conditions.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">2. Products & Quality</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Farmscraft makes every effort to maintain high quality standards.</li>
                            <li>Product specifications and availability may change without prior notice.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">3. Orders & Payments</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Orders are processed only after confirmation and successful payment.</li>
                            <li>Customers are responsible for providing correct details and completing payment.</li>
                            <li>Cancellation is subject to terms in Section 5.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">4. Delivery</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Delivery timelines are approximate and depend on location and logistics.</li>
                            <li>Farmscraft is not responsible for delays caused by external factors.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">5. Returns & Refunds</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-3 ml-4">
                            <li>
                                Orders placed with Farmscraft can be cancelled within 24 hours of confirmation or before dispatch, whichever comes first. Once an order is cancelled, a 2.25% transaction charge will be deducted to cover payment processing costs.
                            </li>
                            <li>
                                In case a product is delivered in damaged or unusable condition, customers must inform the Farmscraft customer support team with proper details within 24-48 hours of delivery. Our team will carefully review the request and verify the issue within 72 hours.
                            </li>
                            <li>
                                If the claim is approved, Farmscraft will arrange a pickup of the damaged item within 15 days from the approval date. After successful pickup and inspection, the refund will be initiated within 7 working days.
                            </li>
                            <li>
                                <strong>There is no return policy for any customized order.</strong>
                            </li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">6. Customer Responsibilities</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Customers must share accurate and complete information.</li>
                            <li>Products must be used as intended and according to instructions.</li>
                            <li>Farmscraft will not be responsible for any loss or damage caused by improper use.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">7. Third-Party Links</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-3 ml-4">
                            <li>
                                Our Service may contain links to third-party websites or services that are not owned or controlled by us. We are not responsible for the content, accuracy, policies, or practices of any third-party websites or services.
                            </li>
                            <li>
                                Any purchase or interaction you make with third-party websites is at your own risk. Please review their terms and policies carefully before proceeding.
                            </li>
                            <li>
                                Any complaints or issues related to third-party products or services should be addressed directly to the respective third-party.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">8. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            All trademarks, logos, product designs, and content related to Farmscraft are the property of the company. Unauthorized use is strictly prohibited.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Farmscraft reserves the right to modify these Terms & Conditions at any time. Continued use of products or services means acceptance of updated terms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">10. Governing Law</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            These Terms & Conditions shall be governed and interpreted in accordance with the laws of India.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about these Terms & Conditions, please contact us:
                        </p>
                        <div className="mt-4 p-6 bg-secondary/20 rounded-lg">
                            <p className="text-foreground font-semibold">Farmscraft</p>
                            <p className="text-muted-foreground">
                                Khewat No. 119/16//67/16/15, Sirsi Loharu Road<br />
                                Bhiwani – 127201, Haryana, India
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
