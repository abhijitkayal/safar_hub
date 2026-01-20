export default function PaymentTable() {
  const data = [
    { product: "Axis Shoes", mode: "Net Banking", price: "₹2,165" },
    { product: "Fitbit Inspire", mode: "Credit Card", price: "₹4,499" },
    { product: "Canon Camera", mode: "Debit Card", price: "₹7,999" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow text-gray-900">
      <h3 className="font-semibold mb-4">Recent Payments</h3>
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="py-2 text-left">Product</th>
            <th>Mode</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b last:border-none">
              <td className="py-2">{row.product}</td>
              <td>{row.mode}</td>
              <td>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
