import VendorTable from "@/app/components/Pages/admin/VendorTable";

export default function PartnersAdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-black">All Partners</h1>
      </div>
      <VendorTable />
    </div>
  );
}
