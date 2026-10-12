// app/terms/page.tsx
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using DTU Shop, you accept and agree to be bound by the terms and provision of this agreement. 
              DTU Shop is the official merchandise store of Delhi Technological University, offering authentic DTU-branded products 
              and university merchandise to students, alumni, faculty, staff, and the general public.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. About DTU Shop</h2>
            <p className="text-gray-700 mb-4">
              DTU Shop is the official online store operated by Delhi Technological University to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Sell authentic DTU-branded merchandise and apparel</li>
              <li>Provide university stationery and academic supplies</li>
              <li>Offer official DTU memorabilia and gifts</li>
              <li>Support university activities through merchandise sales</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Eligibility</h2>
            <p className="text-gray-700 mb-4">
              DTU Shop is open to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Current and former students of Delhi Technological University</li>
              <li>Faculty members and staff of DTU</li>
              <li>General public interested in DTU merchandise</li>
              <li>Individuals at least 18 years old or with parental consent</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Account Registration</h2>
            <p className="text-gray-700 mb-4">
              To make purchases, you must create an account with accurate information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate shipping and billing information</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Products and Pricing</h2>
            <p className="text-gray-700 mb-4">
              All products sold on DTU Shop are:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Authentic DTU-branded merchandise</li>
              <li>Officially licensed university products</li>
              <li>Subject to availability and stock limitations</li>
              <li>Priced in Indian Rupees (INR) including applicable taxes</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify prices, discontinue products, or limit quantities without prior notice.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Orders and Payment</h2>
            <p className="text-gray-700 mb-4">
              When placing an order:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>All orders are subject to acceptance and product availability</li>
              <li>Payment must be completed before order processing</li>
              <li>We accept various payment methods including UPI, cards, and net banking</li>
              <li>Order confirmation will be sent via email</li>
              <li>We reserve the right to cancel orders for any reason</li>
            </ul>

            {/* <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Shipping and Delivery</h2>
            <p className="text-gray-700 mb-4">
              Shipping terms:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Delivery within India only</li>
              <li>Shipping charges apply based on location and order value</li>
              <li>Estimated delivery times are provided but not guaranteed</li>
              <li>Risk of loss transfers to buyer upon delivery</li>
              <li>Campus pickup available for DTU community members</li>
            </ul> */}

            {/* <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Returns and Exchanges</h2>
            <p className="text-gray-700 mb-4">
              Return policy:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Returns accepted within 7 days of delivery</li>
              <li>Items must be unused, unwashed, and in original packaging</li>
              <li>Custom or personalized items are non-returnable</li>
              <li>Return shipping costs borne by customer unless item is defective</li>
              <li>Refunds processed within 7-10 business days</li>
            </ul> */}

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All DTU logos, trademarks, and designs are the exclusive property of Delhi Technological University. 
              Unauthorized use, reproduction, or distribution of DTU intellectual property is strictly prohibited.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. User Conduct</h2>
            <p className="text-gray-700 mb-4">
              Users must not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to reverse engineer or hack the website</li>
              <li>Submit false or fraudulent information</li>
              <li>Resell DTU merchandise for commercial purposes without authorization</li>
              <li>Interfere with the platform's operation or other users' experience</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
              use, and protect your personal information in accordance with applicable data protection laws.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Delhi Technological University and DTU Shop are not liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Indirect, incidental, or consequential damages</li>
              <li>Delays in shipping or delivery</li>
              <li>Product defects beyond our reasonable control</li>
              <li>Loss or damage during shipping</li>
              <li>Technical issues or website downtime</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These terms are governed by the laws of India. Any disputes shall be subject to the 
              exclusive jurisdiction of the courts in Delhi, India.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We may update these terms from time to time. Changes will be posted on this page with 
              an updated "Last modified" date. Continued use constitutes acceptance of new terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these terms or DTU Shop services, please contact us:
            </p>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>DTU Shop Customer Service</strong><br />
                Email: shop@dtu.ac.in<br />
                Phone: +91-11-2787-1023<br />
                Address: Delhi Technological University<br />
                Shahbad Daulatpur, Main Bawana Road<br />
                Delhi - 110042, India
              </p>
            </div>

            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Official DTU Merchandise Store</h3>
              <p className="text-gray-700">
                DTU Shop is the only authorized online store for official Delhi Technological University merchandise. 
                All proceeds support university activities and student programs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
