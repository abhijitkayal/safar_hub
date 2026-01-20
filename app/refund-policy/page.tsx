export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At SafarHub, we strive to ensure customer satisfaction with all bookings made through our platform. This Refund Policy outlines the terms and conditions under which refunds may be processed for bookings of stays, tours, adventures, and vehicle rentals.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">2. General Refund Principles</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refund eligibility and amounts depend on several factors including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>The type of service booked</li>
              <li>The cancellation policy of the specific vendor</li>
              <li>The timing of the cancellation request</li>
              <li>The reason for cancellation</li>
              <li>Any applicable terms and conditions agreed upon at the time of booking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">3. Cancellation Timeframes</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">3.1 Full Refund Eligibility</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may be eligible for a full refund (minus processing fees) if you cancel:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>More than 48 hours before the scheduled service date/time</li>
              <li>Within 24 hours of booking (if the service date is more than 48 hours away)</li>
              <li>Due to vendor cancellation or service unavailability</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">3.2 Partial Refund Eligibility</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may be eligible for a partial refund if you cancel:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Between 24-48 hours before the scheduled service date/time (typically 50% refund)</li>
              <li>Less than 24 hours before the scheduled service (typically no refund, unless specified otherwise)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">3.3 No Refund Scenarios</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              No refund will be provided in the following cases:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>No-show without prior cancellation</li>
              <li>Cancellation after the service has commenced</li>
              <li>Violation of terms and conditions by the customer</li>
              <li>Services marked as "non-refundable" at the time of booking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">4. Service-Specific Policies</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">4.1 Stays (Hotels, Homestays, B&Bs)</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Free cancellation:</strong> Full refund if cancelled 48+ hours before check-in</li>
              <li><strong>Standard cancellation:</strong> 50% refund if cancelled 24-48 hours before check-in</li>
              <li><strong>Non-refundable:</strong> No refund for cancellations made less than 24 hours before check-in</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">4.2 Tours and Adventures</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Full refund:</strong> Cancellation 72+ hours before tour/adventure start time</li>
              <li><strong>Partial refund:</strong> 50% refund if cancelled 24-72 hours before start time</li>
              <li><strong>No refund:</strong> Cancellation less than 24 hours before start time</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">4.3 Vehicle Rentals</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Full refund:</strong> Cancellation 48+ hours before rental start time</li>
              <li><strong>Partial refund:</strong> 50% refund if cancelled 24-48 hours before start time</li>
              <li><strong>No refund:</strong> Cancellation less than 24 hours before start time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">5. Processing Fees</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A processing fee may be deducted from refunds to cover transaction costs. This fee typically ranges from 2-5% of the booking amount, depending on the payment method used. Processing fees are non-refundable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">6. Refund Processing Time</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Once your refund request is approved:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
              <li><strong>UPI:</strong> 3-5 business days</li>
              <li><strong>Net Banking:</strong> 5-7 business days</li>
              <li><strong>Wallet:</strong> 1-3 business days</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds will be processed to the original payment method used for the booking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">7. How to Request a Refund</h2>
            <p className="text-gray-700 leading-relaxed mb-4">To request a refund:</p>
            <ol className="list-decimal pl-6 text-gray-700 mb-4 space-y-2">
              <li>Log in to your SafarHub account</li>
              <li>Navigate to "My Bookings" section</li>
              <li>Select the booking you wish to cancel</li>
              <li>Click "Cancel Booking" and follow the prompts</li>
              <li>Or contact our customer support team with your booking reference number</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">8. Special Circumstances</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">8.1 Force Majeure</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              In cases of natural disasters, pandemics, government restrictions, or other force majeure events, we will work with vendors to provide full or partial refunds or rescheduling options.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">8.2 Vendor Cancellations</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If a vendor cancels your booking, you will receive a full refund automatically, or we will help you find an alternative service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">8.3 Service Quality Issues</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you experience significant issues with the service quality that do not meet the advertised standards, please contact us within 24 hours of service completion. We will review your case and may provide a partial or full refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">9. Disputes and Appeals</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you disagree with a refund decision, you may appeal by contacting our customer support team with detailed information about your booking and the reason for your appeal. We will review your case within 5-7 business days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">10. Changes to Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting on this page. Your continued use of our services after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For refund-related inquiries or assistance, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> cyberspaceworksofficial@gmail.com</p>
              <p className="text-gray-700"><strong>Phone:</strong> +91 7980715765</p>
              <p className="text-gray-700"><strong>Address:</strong> Kolkata, India</p>
              <p className="text-gray-700 mt-2"><strong>Support Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

