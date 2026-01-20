"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash, FaFileInvoice, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

type InvoiceItem = {
      description: string;
      quantity: number;
      price: number;
      amount: number;
};

export default function AddInvoicePage() {
      const router = useRouter();
      const [loading, setLoading] = useState(false);
      const [customerName, setCustomerName] = useState("");
      const [customerEmail, setCustomerEmail] = useState("");
      const [customerPhone, setCustomerPhone] = useState("");
      const [customerAddress, setCustomerAddress] = useState("");
      const [dueDate, setDueDate] = useState("");
      const [notes, setNotes] = useState("");
      const [items, setItems] = useState<InvoiceItem[]>([
            { description: "", quantity: 1, price: 0, amount: 0 },
      ]);
      const [tax, setTax] = useState(0);
      const [discount, setDiscount] = useState(0);

      const handleAddItem = () => {
            setItems([...items, { description: "", quantity: 1, price: 0, amount: 0 }]);
      };

      const handleRemoveItem = (index: number) => {
            if (items.length === 1) return;
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
      };

      const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
            const newItems = [...items];
            const item = { ...newItems[index] };

            if (field === "description") {
                  item.description = value as string;
            } else if (field === "quantity") {
                  item.quantity = Number(value);
                  item.amount = item.quantity * item.price;
            } else if (field === "price") {
                  item.price = Number(value);
                  item.amount = item.quantity * item.price;
            }

            newItems[index] = item;
            setItems(newItems);
      };

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const totalAmount = subtotal + Number(tax) - Number(discount);

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!customerName || !dueDate || items.some(i => !i.description)) {
                  toast.error("Please fill all required fields");
                  return;
            }

            setLoading(true);
            try {
                  const res = await fetch("/api/invoices", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                              customerName,
                              customerEmail,
                              customerPhone,
                              customerAddress,
                              items,
                              subtotal,
                              tax: Number(tax),
                              discount: Number(discount),
                              totalAmount,
                              dueDate,
                              notes,
                        }),
                  });

                  const data = await res.json();
                  if (res.ok) {
                        toast.success("Invoice created successfully");
                        router.push("/admin/invoices");
                  } else {
                        toast.error(data.message || "Failed to create invoice");
                  }
            } catch (error) {
                  toast.error("An error occurred");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 pt-24">
                  <div className="flex items-center gap-4 mb-8">
                        <button
                              onClick={() => router.back()}
                              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                              <FaArrowLeft className="text-gray-600" />
                        </button>
                        <div>
                              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FaFileInvoice className="text-green-600" />
                                    Create New Invoice
                              </h1>
                              <p className="text-gray-500 text-sm">Add manual billing details for a customer</p>
                        </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Customer Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Customer Information</h2>
                              <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name *</label>
                                          <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
                                                placeholder="John Doe"
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                                          <input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
                                                placeholder="john@example.com"
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
                                          <input
                                                type="text"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
                                                placeholder="9876543210"
                                          />
                                    </div>
                                    <div className="space-y-1">
                                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date *</label>
                                          <input
                                                type="date"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
                                          />
                                    </div>
                              </div>
                              <div className="mt-4 space-y-1">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Billing Address</label>
                                    <textarea
                                          value={customerAddress}
                                          onChange={(e) => setCustomerAddress(e.target.value)}
                                          rows={2}
                                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
                                          placeholder="123 Street, City, State, Pincode"
                                    />
                              </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">Items & Charges</h2>
                                    <button
                                          type="button"
                                          onClick={handleAddItem}
                                          className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                                    >
                                          <FaPlus /> Add Item
                                    </button>
                              </div>

                              <div className="space-y-4">
                                    {items.map((item, index) => (
                                          <div key={index} className="grid gap-4 grid-cols-[1fr_80px_120px_100px_40px] items-end">
                                                <div className="space-y-1">
                                                      {index === 0 && <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>}
                                                      <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none"
                                                            placeholder="Item name"
                                                      />
                                                </div>
                                                <div className="space-y-1">
                                                      {index === 0 && <label className="text-[10px] font-bold text-gray-500 uppercase">Qty</label>}
                                                      <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none"
                                                            min="1"
                                                      />
                                                </div>
                                                <div className="space-y-1">
                                                      {index === 0 && <label className="text-[10px] font-bold text-gray-500 uppercase">Price (₹)</label>}
                                                      <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, "price", e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none"
                                                      />
                                                </div>
                                                <div className="space-y-1">
                                                      {index === 0 && <label className="text-[10px] font-bold text-gray-500 uppercase">Amount</label>}
                                                      <div className="w-full px-3 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-lg">
                                                            ₹{item.amount.toLocaleString()}
                                                      </div>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => handleRemoveItem(index)}
                                                      className="p-2 text-gray-400 hover:text-red-500"
                                                >
                                                      <FaTrash />
                                                </button>
                                          </div>
                                    ))}
                              </div>

                              {/* Totals */}
                              <div className="mt-8 pt-8 border-t space-y-3 max-w-[300px] ml-auto">
                                    <div className="flex justify-between text-sm text-gray-600">
                                          <span>Subtotal:</span>
                                          <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                          <span>Tax (₹):</span>
                                          <input
                                                type="number"
                                                value={tax}
                                                onChange={(e) => setTax(Number(e.target.value))}
                                                className="w-24 rounded border border-gray-200 px-2 py-1 text-right text-gray-900 focus:border-green-600 focus:outline-none"
                                          />
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                          <span>Discount (₹):</span>
                                          <input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value))}
                                                className="w-24 rounded border border-gray-200 px-2 py-1 text-right text-gray-900 focus:border-green-600 focus:outline-none"
                                          />
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                                          <span>Total:</span>
                                          <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                              </div>
                        </div>

                        {/* Notes & Submit */}
                        <div className="space-y-4">
                              <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Additional Notes</label>
                                    <textarea
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          rows={3}
                                          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
                                          placeholder="Terms, payment instructions, etc."
                                    />
                              </div>

                              <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                    {loading ? "Generating Invoice..." : "Create Invoice"}
                              </button>
                        </div>
                  </form>
            </div>
      );
}
