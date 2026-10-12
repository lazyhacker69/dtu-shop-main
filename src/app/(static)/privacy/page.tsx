// app/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-100">
          <div className="mb-8 flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-full">
              <span className="text-2xl font-bold text-red-600">DTU</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-sm text-gray-500">Official DTU Gift Shop &mdash; Last updated: January 1, 2025</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>
              By using the DTU Gift Shop, you agree to these Terms of Service. DTU Gift Shop is the official online store of Delhi Technological University, offering authentic DTU-branded merchandise, apparel, and memorabilia.
            </p>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">2. Who Can Shop</h2>
            <ul className="list-disc pl-6">
              <li>DTU students, alumni, faculty, and staff</li>
              <li>General public interested in official merchandise</li>
              <li>Individuals 18+ or with parental consent</li>
            </ul>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">3. Account &amp; Orders</h2>
            <ul className="list-disc pl-6">
              <li>Register with accurate details to place orders</li>
              <li>Keep your account info secure</li>
              <li>Order confirmation will be sent by email</li>
            </ul>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">4. Products &amp; Pricing</h2>
            <ul className="list-disc pl-6">
              <li>All products are official DTU merchandise</li>
              <li>Prices are in INR and include applicable taxes</li>
              <li>Products are subject to availability</li>
            </ul>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">5. Payments</h2>
            <ul className="list-disc pl-6">
              <li>We accept UPI, cards, and net banking</li>
              <li>Payment must be completed before dispatch</li>
            </ul>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">6. Shipping &amp; Returns</h2>
            <ul className="list-disc pl-6">
              <li>Shipping available across India; campus pickup for DTU community</li>
              <li>Returns accepted within 7 days for unused, original items</li>
              <li>Custom/personalized items are non-returnable</li>
            </ul>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">7. Intellectual Property</h2>
            <p>
              All DTU logos and designs are property of Delhi Technological University. Unauthorized use is prohibited.
            </p>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">8. User Conduct</h2>
            <ul className="list-disc pl-6">
              <li>No unlawful, fraudulent, or disruptive behavior</li>
              <li>No resale of merchandise without DTU authorization</li>
            </ul>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">9. Privacy</h2>
            <p>
              Your data is handled as per our Privacy Policy. We do not share your data except as required to fulfill your order or by law.
            </p>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">10. Limitation of Liability</h2>
            <p>
              DTU and the Gift Shop are not liable for indirect damages, shipping delays, or technical issues beyond our control.
            </p>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">11. Changes to Terms</h2>
            <p>
              We may update these terms. Continued use of the shop means you accept the latest terms.
            </p>

            <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">12. Contact</h2>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>DTU Gift Shop Support</strong><br />
                Email: shop@dtu.ac.in<br />
                Phone: +91-11-2787-1023<br />
                Address: Delhi Technological University, Shahbad Daulatpur, Delhi - 110042
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
