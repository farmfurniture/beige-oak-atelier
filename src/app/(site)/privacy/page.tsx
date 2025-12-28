import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Farm Craft",
  description: "Learn how Farm Industries collects, uses, and protects your personal information when you use farmscraft.com.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-secondary/20 border-b border-border">
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we handle your information.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">About Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              Farm Industries, registered at Khewat No. 119/16//67/16/15, Sirsi Loharu Road, Bhiwani – 127201,
              Haryana, India ("Farm Industries", "we", "our", or "us") owns and operates the website{" "}
              <a href="https://www.farmscraft.com" className="text-accent hover:underline">www.farmscraft.com</a> ("Farmscraft").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We sell furniture and related products ("Products") through our website to our users ("Users", "you", or "your").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This Privacy Policy explains how we collect, use, store, and protect your personal information when you visit, browse, or purchase products from our website.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using our website, you agree to this Privacy Policy and consent to the collection and use of your information as described below.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you place an order or contact us through our website, we may collect the following information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Name</li>
              <li>Mobile number</li>
              <li>Email address</li>
              <li>Delivery address</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not knowingly collect information from users below 18 years of age.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Your personal information is collected only for business purposes and is kept secure. We do not share your data with third parties except where required for delivery, payment processing, or legal obligations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your information only to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Process and deliver your orders</li>
              <li>Provide customer support and respond to your queries</li>
              <li>Send invoices, receipts, and order confirmations</li>
              <li>Improve our products, services, and customer experience</li>
              <li>Comply with applicable Indian laws and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Sharing of Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell or rent your personal information to anyone.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4 mb-4">
              We may share limited information with trusted third-party service providers such as:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Delivery partners</li>
              <li>Payment gateway providers</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This sharing is strictly for order processing, payment completion, and product delivery. All such partners are required to keep your information confidential.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We may also disclose information if required by law, government authorities, or to protect our legal rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take the security of your personal information seriously.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We use reasonable technical, administrative, and physical security measures to protect your data from unauthorized access, misuse, or disclosure.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Access to personal data is limited only to authorized staff for order processing, manufacturing, delivery, or customer support.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, please note that no online system is completely secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website uses cookies to improve your browsing experience and website performance.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4 mb-4">
              Cookies help us to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Remember user preferences</li>
              <li>Improve website functionality</li>
              <li>Analyze website traffic and user behavior</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can disable cookies anytime through your browser settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We keep your personal information only for as long as required to complete orders, meet legal obligations, and maintain business records.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Once the information is no longer needed, it is securely deleted or anonymized.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Any changes will be posted on this page. Continued use of the website means you accept the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy is governed by the laws of India.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Any disputes related to this policy shall be subject to the jurisdiction of Indian courts.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
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
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
