export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using SafarHub's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily access the materials on SafarHub's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">3. Account Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To access certain features of our services, you may be required to register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept all responsibility for activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">4. Bookings and Payments</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">4.1 Booking Process</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you make a booking through SafarHub, you enter into a contract directly with the vendor providing the service. We act as an intermediary platform facilitating the transaction.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">4.2 Pricing</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              All prices displayed on our website are in the currency specified and are subject to change without notice. Prices include applicable taxes unless otherwise stated.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">4.3 Payment</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Payment must be made in full at the time of booking unless otherwise specified. We accept various payment methods as displayed on our website. All payments are processed securely through our payment gateway partners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">5. Cancellation and Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cancellation and refund policies vary by service type and vendor. Please refer to the specific cancellation policy for each booking. Our general refund policy is detailed in our Refund Policy page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">6. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Use the service for any unlawful purpose or in violation of any laws</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
              <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
              <li>Transmit any viruses, worms, defects, or other items of a destructive nature</li>
              <li>Collect or store personal data about other users without their express permission</li>
              <li>Use automated systems to access the service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All content on SafarHub, including but not limited to text, graphics, logos, images, and software, is the property of SafarHub or its content suppliers and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SafarHub acts as an intermediary platform and is not responsible for the quality, safety, or legality of the services provided by vendors. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">9. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree to indemnify and hold harmless SafarHub, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the service or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">10. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              SafarHub reserves the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page and updating the "Last updated" date. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Kolkata, India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms & Conditions, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> cyberspaceworksofficial@gmail.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 7980715765</p>
              <p className="text-gray-700"><strong>Address:</strong> Kolkata, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

