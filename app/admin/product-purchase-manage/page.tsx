import OrderFulfillmentTable from "@/app/components/orders/OrderFulfillmentTable";

const ProductPurchaseManagePage = () => {
  return (
    <div className="space-y-8 lg:pt-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Purchase Manage</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review which vendors sold items, who bought them, and keep statuses in sync without leaving the dashboard.
        </p>
      </div>

      <OrderFulfillmentTable
        fetchUrl="/api/admin/orders?scope=vendor"
        title="Vendor Product Purchases"
        description="Shows purchases for every vendor product listed on the marketplace."
        showVendorColumn
        readOnly={true}
      />
    </div>
  );
};

export default ProductPurchaseManagePage;

