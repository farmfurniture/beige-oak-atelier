"use client";

import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
    {
        category: "Ordering & Payment",
        questions: [
            {
                question: "How do I place an order?",
                answer: "Simply browse our catalog, select the products you like, add them to your cart, and proceed to checkout. You can pay securely using our available payment methods including credit/debit cards, UPI, and net banking."
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, Mastercard, Rupay), debit cards, UPI payments (Google Pay, PhonePe, Paytm), net banking, and other popular payment methods through our secure payment gateway."
            },
            {
                question: "Can I modify or cancel my order after placing it?",
                answer: "You can modify or cancel your order before it has been shipped by contacting our customer support. Once the order is shipped, modifications are not possible. Custom orders cannot be cancelled once production has begun."
            },
            {
                question: "How will I receive my order confirmation?",
                answer: "You will receive an order confirmation email and SMS immediately after your order is placed successfully. This will include your order number and estimated delivery date."
            },
            {
                question: "Is it safe to make online payments on your website?",
                answer: "Yes, absolutely. We use industry-standard SSL encryption and trusted payment gateways to ensure your payment information is secure. We never store your card details on our servers."
            }
        ]
    },
    {
        category: "Shipping & Delivery",
        questions: [
            {
                question: "How long will it take to receive my order?",
                answer: "Delivery times vary based on the product: Ready stock items take 7-14 business days, made-to-order items take 2-4 weeks, and custom orders may take 4-8 weeks. You will receive tracking information once your order is shipped."
            },
            {
                question: "Do you deliver to my city?",
                answer: "We deliver to all major cities and towns across India. For remote locations, additional shipping charges may apply. Please contact us to confirm delivery availability in your area."
            },
            {
                question: "What are the shipping charges?",
                answer: "Shipping charges are calculated based on product size, weight, and delivery location. The exact cost is shown at checkout. We offer free shipping on select items and large orders."
            },
            {
                question: "Will someone help with unloading and assembly?",
                answer: "Our delivery includes doorstep/ground floor delivery. Assembly services are available for select products at an additional charge. Please check the product page or contact us for details."
            },
            {
                question: "What if I'm not available at the time of delivery?",
                answer: "Our delivery partner will contact you before delivery to schedule a convenient time. If you're unavailable, they will attempt redelivery. Please ensure someone is available to receive and inspect the furniture."
            }
        ]
    },
    {
        category: "Returns & Refunds",
        questions: [
            {
                question: "What is your return policy?",
                answer: "We offer a 7-day return policy for eligible items. The product must be unused, in original packaging, and undamaged. Custom-made and personalized items are not eligible for return."
            },
            {
                question: "How do I return a product?",
                answer: "Contact our customer support within 7 days of delivery with your order number and reason for return. We will arrange for pickup from your location. Once we receive and inspect the product, your refund will be processed."
            },
            {
                question: "How long does it take to receive a refund?",
                answer: "Refunds are processed within 7-10 business days after we receive the returned product. The amount will be credited to your original payment method."
            },
            {
                question: "What if I receive a damaged product?",
                answer: "If you receive a damaged or defective item, please contact us within 24 hours of delivery with photos of the damage. We will arrange for a replacement or refund at no additional cost."
            }
        ]
    },
    {
        category: "Products & Customization",
        questions: [
            {
                question: "Are your products handmade?",
                answer: "Yes, all our furniture is handcrafted by skilled artisans using traditional techniques. Each piece is made with care and attention to detail, ensuring quality and uniqueness."
            },
            {
                question: "Can I customize the dimensions or finish of a product?",
                answer: "Yes, we offer customization options for many of our products. You can request changes to dimensions, wood type, finish, and upholstery. Please contact us or use our custom order form for personalized furniture."
            },
            {
                question: "What type of wood do you use?",
                answer: "We use sustainably sourced hardwoods including Sheesham (Indian Rosewood), Mango Wood, Acacia, and other premium varieties. The specific wood type is mentioned on each product page."
            },
            {
                question: "Do products come with a warranty?",
                answer: "Yes, our furniture comes with a warranty against manufacturing defects. The warranty period varies by product. Please check the product page for specific warranty information."
            },
            {
                question: "Why might there be slight variations in my product?",
                answer: "Due to the handcrafted nature of our furniture and natural variations in wood, slight differences in color, texture, and grain patterns are normal and add to the unique character of each piece."
            }
        ]
    },
    {
        category: "Care & Maintenance",
        questions: [
            {
                question: "How do I care for my wooden furniture?",
                answer: "Dust regularly with a soft, dry cloth. Avoid placing furniture in direct sunlight or near heat sources. Use coasters for hot or wet items. Clean spills immediately. Apply furniture polish or wax periodically to maintain the finish."
            },
            {
                question: "Can I place furniture outdoors?",
                answer: "Our furniture is designed for indoor use unless specifically mentioned as outdoor furniture. Indoor furniture should not be exposed to rain, extreme heat, or humidity as it may damage the wood."
            }
        ]
    }
];

export default function FAQ() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-secondary/20 border-b border-border">
                <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Find answers to common questions about our products and services.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {faqCategories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-10">
                            <h2 className="text-2xl font-semibold text-foreground mb-6">
                                {category.category}
                            </h2>
                            <Accordion type="single" collapsible className="w-full">
                                {category.questions.map((faq, index) => (
                                    <AccordionItem key={index} value={`${categoryIndex}-${index}`}>
                                        <AccordionTrigger className="text-left text-foreground hover:text-accent">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}

                    <div className="mt-12 p-8 bg-secondary/20 rounded-lg text-center">
                        <h2 className="text-xl font-semibold text-foreground mb-4">
                            Still have questions?
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Can&apos;t find what you&apos;re looking for? Our customer support team is here to help.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
