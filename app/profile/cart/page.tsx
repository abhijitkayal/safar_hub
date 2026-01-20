"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowRight, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { useCart } from "../../hooks/useCart";
import LocalLoader from "../../components/common/LocalLoader";

export default function CartPage() {
  const router = useRouter();
  const { items, loading, refresh, removeFromCart, updateQuantity, productTotal } = useCart({ autoLoad: true });
  const [processing, setProcessing] = useState<string | null>(null);

  const getServiceDetailPath = (itemType: string, itemId: string) => {
    switch (itemType) {
      case "Stay":
        return `/stays/${itemId}`;
      case "Tour":
        return `/tours/${itemId}`;
      case "Adventure":
        return `/adventures/${itemId}`;
      case "VehicleRental":
        return `/vehicle-rental/${itemId}`;
      default:
        return "";
    }
  };

  const handleServiceNavigate = (item: any) => {
    const path = getServiceDetailPath(item.itemType, item.itemId);
    if (path) {
      router.push(path);
    }
  };

  const handleProductCardClick = (itemId: string) => {
    router.push(`/products/${itemId}`);
  };

  const getStockValue = (cartItem: any) => {
    if (typeof cartItem.variant?.stock === "number") return cartItem.variant.stock;
    if (typeof cartItem.item?.stock === "number") return cartItem.item.stock;
    return null;
  };

  const handleIncrease = async (cartItem: any) => {
    const stockValue = getStockValue(cartItem);
    if (stockValue !== null && cartItem.quantity >= stockValue) {
      alert("Maximum stock reached");
      return;
    }
    await handleQuantityChange(cartItem._id, cartItem.quantity + 1);
  };

  const handleRemove = async (cartItemId: string) => {
    if (!confirm("Remove this item from cart?")) return;
    setProcessing(cartItemId);
    try {
      await removeFromCart(cartItemId);
    } catch (err) {
      alert("Failed to remove item");
    } finally {
      setProcessing(null);
    }
  };

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemove(cartItemId);
      return;
    }
    setProcessing(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (err) {
      alert("Failed to update quantity");
    } finally {
      setProcessing(null);
    }
  };

  const handleBuyNow = (item: any) => {
    const variantParam = item.variantId ? `&variant=${item.variantId}` : "";
    router.push(`/checkout?item=${item.itemId}&type=${item.itemType}&quantity=${item.quantity}${variantParam}`);
  };

  const handleCheckout = () => {
    // Only allow checkout for products
    const productItems = items.filter((item) => item.itemType === "Product");
    if (productItems.length === 0) {
      alert("Only products can be checked out together. Services must be purchased individually.");
      return;
    }
    router.push("/checkout?fromCart=true");
  };

  if (loading) {
    return <LocalLoader />;
  }

  const productItems = items.filter((item) => item.itemType === "Product");
  const serviceItems = items.filter((item) => item.itemType !== "Product");
  const deliveryCharge = productItems.length > 0 ? 15 : 0;
  const grandTotal = productTotal + deliveryCharge;

  return (
    <div className="space-y-6 lg:pt-15 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-sm text-gray-600">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaShoppingCart className="text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items to your cart to get started</p>
          <button
            onClick={() => router.push("/services/products")}
            className="rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {productItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                {productItems.map((item) => {
                  const price = item.variant?.price ?? item.item?.price ?? item.item?.basePrice ?? 0;
                  const image =
                    item.variant?.photos?.[0] ||
                    item.item?.images?.[0] ||
                    item.item?.photos?.[0] ||
                    "/placeholder.jpg";
                  const stockValue = getStockValue(item);
                  const outOfStock = Boolean(
                    item.item?.outOfStock || (stockValue !== null && stockValue <= 0)
                  );
                  const stockLeft =
                    stockValue !== null ? Math.max(stockValue - item.quantity, 0) : null;
                  return (
                    <div
                      key={item._id}
                      onClick={() => handleProductCardClick(item.itemId)}
                      className="group relative flex cursor-pointer gap-4 rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        <Image src={image} alt={item.item?.name || "Product"} fill className="object-cover transition duration-500 group-hover:scale-105" />
                        {outOfStock && (
                          <span className="absolute left-2 top-2 rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-semibold uppercase text-white shadow">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{item.item?.name}</h3>
                            <p className="text-xs uppercase tracking-wide text-gray-500">{item.item?.category}</p>
                            {item.variant && (
                              <p className="text-sm text-gray-600 mt-1">
                                Variant:{" "}
                                <span className="font-medium text-gray-900">
                                  {item.variant.color} • {item.variant.size}
                                </span>
                              </p>
                            )}
                          </div>
                          <p className="text-lg font-bold text-green-600">₹{price.toLocaleString()}</p>
                        </div>
                        {stockValue !== null && (
                          <p className="text-xs text-gray-500">
                            Stock left: <span className="font-medium text-gray-900">{stockLeft}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(item._id, item.quantity - 1);
                            }}
                            disabled={processing === item._id || item.quantity <= 1}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-10 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleIncrease(item);
                            }}
                            disabled={processing === item._id || outOfStock}
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(item);
                            }}
                            disabled={processing === item._id || outOfStock}
                            className="px-5 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(item._id);
                            }}
                            disabled={processing === item._id}
                            className="px-5 py-2 rounded-full bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {serviceItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                {serviceItems.map((item) => {
                  const price = item.item?.price || item.item?.basePrice || 0;
                  const image =
                    item.item?.images?.[0] || item.item?.photos?.[0] || item.item?.coverImage || item.item?.banner || "/placeholder.jpg";
                  
                  // Get rating if available
                  const ratingValue = item.item?.rating?.count ? item.item.rating.average : null;
                  
                  return (
                    <div
                      key={item._id}
                      onClick={() => handleServiceNavigate(item)}
                      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/40 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="relative h-56 w-full">
                        <Image src={image} alt={item.item?.name || "Service"} fill className="object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-emerald-700 shadow">
                          {item.item?.category || item.itemType}
                        </span>
                        {ratingValue !== null && (
                          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 shadow">
                            <FaStar className="text-yellow-500" /> {ratingValue.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5 text-gray-900">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.item?.name}</h3>
                            {item.item?.location?.city && (
                              <p className="mt-1 flex items-center text-sm text-gray-600">
                                <FaMapMarkerAlt className="mr-2 text-green-600" />
                                {item.item.location.city}
                                {item.item.location.state ? `, ${item.item.location.state}` : ""}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {item.itemType}
                          </span>
                        </div>
                        
                        {item.item?.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{item.item.description}</p>
                        )}
                        
                        {item.item?.heroHighlights?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.item.heroHighlights.slice(0, 3).map((highlight: string) => (
                              <span
                                key={highlight}
                                className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-xs uppercase tracking-wide text-gray-500">
                            Quantity fixed at 1
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(item._id);
                            }}
                            disabled={processing === item._id}
                            className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleServiceNavigate(item);
                          }}
                          className="mt-2 inline-flex items-center justify-center rounded-full border border-green-200 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition"
                        >
                          View Details
                        </button>
                        <p className="text-xs text-gray-500">Tap the card to view details. Quantity fixed at 1.</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {productItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{productTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform Charge</span>
                  <span>₹{deliveryCharge}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700"
              >
                Proceed to Checkout <FaArrowRight />
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Only physical products can be checked out together.
              </p>
              {serviceItems.length > 0 && (
                <p className="text-xs text-amber-600 mt-1 text-center">
                  Service bookings are billed separately on their detail pages.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

