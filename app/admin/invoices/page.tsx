"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaSearch, FaFileInvoice, FaEye, FaDownload, FaTrash, FaTimes, FaPrint } from "react-icons/fa";
import LocalLoader from "../../components/common/LocalLoader";
import toast from "react-hot-toast";

type InvoiceItem = {
      description: string;
      quantity: number;
      price: number;
      amount: number;
};

type Invoice = {
      _id: string;
      invoiceNumber: string;
      customerName: string;
      customerEmail?: string;
      customerPhone?: string;
      customerAddress?: string;
      items: InvoiceItem[];
      subtotal: number;
      tax: number;
      discount: number;
      totalAmount: number;
      status: string;
      dueDate: string;
      notes?: string;
      createdAt: string;
};

export default function InvoicesListPage() {
      const router = useRouter();
      const [invoices, setInvoices] = useState<Invoice[]>([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState("");
      const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
      const [showModal, setShowModal] = useState(false);

      const fetchInvoices = async () => {
            try {
                  const res = await fetch("/api/invoices");
                  const data = await res.json();
                  if (data.success) {
                        setInvoices(data.invoices);
                  }
            } catch (error) {
                  toast.error("Failed to load invoices");
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchInvoices();
      }, []);

      const handleDelete = async (id: string) => {
            if (!confirm("Are you sure you want to delete this invoice?")) return;
            try {
                  const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
                  const data = await res.json();
                  if (data.success) {
                        toast.success("Invoice deleted");
                        fetchInvoices();
                  } else {
                        toast.error(data.message || "Delete failed");
                  }
            } catch (error) {
                  toast.error("Error deleting invoice");
            }
      };

      const handlePrint = () => {
            window.print();
      };

      const filteredInvoices = invoices.filter(
            (inv) =>
                  inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const getStatusColor = (status: string) => {
            switch (status) {
                  case "Paid": return "bg-green-100 text-green-700";
                  case "Pending": return "bg-yellow-100 text-yellow-700";
                  case "Overdue": return "bg-red-100 text-red-700";
                  default: return "bg-gray-100 text-gray-700";
            }
      };

      if (loading) return <LocalLoader />;

      return (
            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-24">
                  {/* Print styles */}
                  <style jsx global>{`
        @media print {
          nav, aside, button, .no-print, header, footer {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
          }
          .modal-content {
            box-shadow: none !important;
            border: none !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .fixed {
            position: relative !important;
          }
        }
      `}</style>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
                        <div>
                              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FaFileInvoice className="text-green-600" />
                                    Invoices
                              </h1>
                              <p className="text-gray-500">Manage your billing and administrative invoices</p>
                        </div>
                        <button
                              onClick={() => router.push("/admin/add-invoices")}
                              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100"
                        >
                              <FaPlus /> Create Invoice
                        </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden no-print">
                        <div className="p-4 border-b bg-gray-50/50">
                              <div className="relative max-w-md">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                          type="text"
                                          placeholder="Search by invoice number or customer..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-600 focus:outline-none bg-white text-sm"
                                    />
                              </div>
                        </div>

                        <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                          <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice / Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                          </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                          {filteredInvoices.length === 0 ? (
                                                <tr>
                                                      <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                                            <div className="flex flex-col items-center gap-2">
                                                                  <FaFileInvoice className="text-4xl text-gray-200" />
                                                                  <p>No invoices found</p>
                                                            </div>
                                                      </td>
                                                </tr>
                                          ) : (
                                                filteredInvoices.map((invoice) => (
                                                      <tr key={invoice._id} className="hover:bg-gray-50 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                  <div className="font-bold text-gray-900">{invoice.invoiceNumber}</div>
                                                                  <div className="text-xs text-gray-500">
                                                                        {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                                                                              day: "numeric",
                                                                              month: "short",
                                                                              year: "numeric"
                                                                        })}
                                                                  </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                  <div className="font-medium text-gray-900">{invoice.customerName}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                  <div className="font-bold text-gray-900">₹{invoice.totalAmount.toLocaleString()}</div>
                                                                  <div className="text-[10px] text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(invoice.status)}`}>
                                                                        {invoice.status}
                                                                  </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                  <div className="flex items-center justify-end gap-2 transition-opacity">
                                                                        <button
                                                                              onClick={() => {
                                                                                    setSelectedInvoice(invoice);
                                                                                    setShowModal(true);
                                                                              }}
                                                                              title="View Details"
                                                                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                        >
                                                                              <FaEye />
                                                                        </button>
                                                                        <button
                                                                              onClick={() => {
                                                                                    setSelectedInvoice(invoice);
                                                                                    setTimeout(handlePrint, 100);
                                                                              }}
                                                                              title="Print / PDF"
                                                                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        >
                                                                              <FaDownload />
                                                                        </button>
                                                                        <button
                                                                              onClick={() => handleDelete(invoice._id)}
                                                                              title="Delete Invoice"
                                                                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        >
                                                                              <FaTrash />
                                                                        </button>
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))
                                          )}
                                    </tbody>
                              </table>
                        </div>
                  </div>

                  {/* Invoice Detail Modal */}
                  {showModal && selectedInvoice && (
                        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
                              <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative modal-content shadow-2xl">
                                    <div className="sticky top-0 bg-white px-8 py-4 border-b flex items-center justify-between no-print z-10">
                                          <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                                          <div className="flex items-center gap-2">
                                                <button
                                                      onClick={handlePrint}
                                                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition"
                                                >
                                                      <FaPrint /> Print / Save PDF
                                                </button>
                                                <button
                                                      onClick={() => setShowModal(false)}
                                                      className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                                >
                                                      <FaTimes />
                                                </button>
                                          </div>
                                    </div>

                                    <div className="p-8 space-y-8" id="invoice-bill">
                                          <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                      <div className="text-3xl font-black text-green-600 tracking-tighter uppercase">SAFARHUB</div>
                                                      <p className="text-xs text-gray-500 font-medium">Official Invoice Document</p>
                                                </div>
                                                <div className="text-right">
                                                      <div className="text-2xl font-bold text-gray-900">INVOICE</div>
                                                      <div className="text-green-600 font-bold">#{selectedInvoice.invoiceNumber}</div>
                                                      <p className="text-xs text-gray-500 mt-1">Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                                                      <p className="text-xs text-gray-500">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                                                </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                                                <div>
                                                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Billed To</label>
                                                      <div className="space-y-1">
                                                            <p className="font-bold text-gray-900 text-lg">{selectedInvoice.customerName}</p>
                                                            {selectedInvoice.customerEmail && <p className="text-sm text-gray-600">{selectedInvoice.customerEmail}</p>}
                                                            {selectedInvoice.customerPhone && <p className="text-sm text-gray-600">Ph: {selectedInvoice.customerPhone}</p>}
                                                            {selectedInvoice.customerAddress && (
                                                                  <p className="text-sm text-gray-500 leading-relaxed max-w-[240px] pt-1">
                                                                        {selectedInvoice.customerAddress}
                                                                  </p>
                                                            )}
                                                      </div>
                                                </div>
                                                <div className="text-right">
                                                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Payment Status</label>
                                                      <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(selectedInvoice.status)}`}>
                                                            {selectedInvoice.status}
                                                      </div>
                                                </div>
                                          </div>

                                          <table className="w-full text-left mt-8">
                                                <thead className="border-b-2 border-gray-100">
                                                      <tr>
                                                            <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                                            <th className="py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                                                            <th className="py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
                                                            <th className="py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                                      </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                      {selectedInvoice.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                  <td className="py-4">
                                                                        <p className="font-bold text-gray-900">{item.description}</p>
                                                                  </td>
                                                                  <td className="py-4 text-center text-sm font-medium text-gray-700">{item.quantity}</td>
                                                                  <td className="py-4 text-right text-sm font-medium text-gray-700">₹{item.price.toLocaleString()}</td>
                                                                  <td className="py-4 text-right font-bold text-gray-900">₹{item.amount.toLocaleString()}</td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>

                                          <div className="flex justify-end pt-8 border-t border-gray-100">
                                                <div className="w-full max-w-[280px] space-y-3">
                                                      <div className="flex justify-between text-sm text-gray-600">
                                                            <span>Subtotal:</span>
                                                            <span className="font-bold">₹{selectedInvoice.subtotal.toLocaleString()}</span>
                                                      </div>
                                                      {selectedInvoice.tax > 0 && (
                                                            <div className="flex justify-between text-sm text-gray-600">
                                                                  <span>Tax:</span>
                                                                  <span className="font-bold">₹{selectedInvoice.tax.toLocaleString()}</span>
                                                            </div>
                                                      )}
                                                      {selectedInvoice.discount > 0 && (
                                                            <div className="flex justify-between text-sm text-red-600">
                                                                  <span>Discount:</span>
                                                                  <span className="font-bold">-₹{selectedInvoice.discount.toLocaleString()}</span>
                                                            </div>
                                                      )}
                                                      <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t-2 border-gray-100">
                                                            <span>TOTAL:</span>
                                                            <span className="text-green-600">₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                                                      </div>
                                                </div>
                                          </div>

                                          {selectedInvoice.notes && (
                                                <div className="pt-8 border-t border-gray-100">
                                                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Notes</label>
                                                      <p className="text-sm text-gray-500 leading-relaxed italic">"{selectedInvoice.notes}"</p>
                                                </div>
                                          )}

                                          <div className="pt-12 text-center border-t border-dashed border-gray-200">
                                                <p className="text-xs text-gray-400 font-medium italic">Thank you for your business with SafarHub.</p>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}
