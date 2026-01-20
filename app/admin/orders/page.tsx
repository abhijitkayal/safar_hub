import OrderFulfillmentTable from "@/app/components/orders/OrderFulfillmentTable";

const AdminOrdersPage = () => {
  return (
    <div className="space-y-8 lg:pt-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track every purchase made for admin-managed products. Update delivery commitments and fulfillment status without
          leaving this page.
        </p>
      </div>

      <OrderFulfillmentTable
        fetchUrl="/api/admin/orders?scope=admin"
        title="Admin Product Orders"
        description="Includes every order placed for products uploaded by the admin team."
      />
    </div>
  );
};

export default AdminOrdersPage;

