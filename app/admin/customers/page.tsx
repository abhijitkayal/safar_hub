import CustomerTable from "@/app/components/Pages/admin/CustomerTable";

export default function CustomersAdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-black">All Customers</h1>
      </div>
      <CustomerTable />
    </div>
  );
}


