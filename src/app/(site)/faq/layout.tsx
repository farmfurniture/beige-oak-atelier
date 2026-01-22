import { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ | FarmsCraft",
    description: "Find answers to frequently asked questions about Farm Industries furniture, ordering, shipping, and more.",
};

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
