
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSearch, FaShoppingCart, FaStar, FaRupeeSign, FaTag } from "react-icons/fa";
import PageLoader from "../components/common/PageLoader";
import { useCart } from "../hooks/useCart";
import { toast } from "react-hot-toast";
import CategoryTabs from "@/app/components/common/CategoryTabs";

export type ProductVariant = {
  _id?: string;
  color: string;
  size: string;
  stock: number;
  photos: string[];
  price?: number;
};

export type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  images: string[];
  variants?: ProductVariant[];
  tags?: string[];
  isActive: boolean;
  stock?: number;
  outOfStock?: boolean;
  listingType: "buy" | "rent";
  rentPriceDay?: number;
  rating?: {
    average: number;
    count: number;
  };
};

type ProductCardProps = {
  product: Product;
  isInCart?: boolean;
  onAddToCart?: (event: React.MouseEvent) => void;
  onSelectTag?: (tag: string) => void;
};

const ProductCard = ({ product, isInCart, onAddToCart, onSelectTag }: ProductCardProps) => {
  const isRent = product.listingType === "rent";
  const hasVariants = product.variants && product.variants.length > 0;

  let priceDisplay = "";
  if (isRent) {
    priceDisplay = `₹${(product.rentPriceDay || 0).toLocaleString()} / day`;
  } else {
    const minPrice = hasVariants && product.variants
      ? Math.min(...product.variants.map((v) => v.price || product.basePrice))
      : product.basePrice;
    const maxPrice = hasVariants && product.variants
      ? Math.max(...product.variants.map((v) => v.price || product.basePrice))
      : product.basePrice;
    priceDisplay =
      minPrice === maxPrice
        ? `₹${minPrice.toLocaleString()}`
        : `₹${minPrice.toLocaleString()} - ₹${maxPrice.toLocaleString()}`;
  }

  const explicitStock = typeof product.stock === "number" ? product.stock : null;
  const isInStock = !product.outOfStock && (
    hasVariants
      ? product.variants?.some((v) => v.stock > 0) ?? false
      : (explicitStock === null || explicitStock > 0)
  );

  return (
    <Link
      href={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-xl backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-64 w-full">
        {product.images && product.images.length ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-green-900/60 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-green-700 shadow">
            {product.category}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase shadow ${isRent ? "bg-blue-600 text-white" : "bg-orange-500 text-white"}`}>
            {isRent ? "For Rent" : "For Sale"}
          </span>
        </div>
        {!isInStock && (
          <span className="absolute right-4 bottom-4 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 text-gray-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onAddToCart}
              className={`inline-flex items-center justify-center rounded-full p-2 shadow transition-colors ${isInCart
                ? "bg-green-600 text-green-50 hover:bg-green-700"
                : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              title={isInCart ? "In Cart" : "Add to Cart"}
            >
              <FaShoppingCart className="text-sm" />
            </button>
            {product.rating && product.rating.count > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                <FaStar className="text-yellow-500" /> {product.rating.average.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {product.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="rounded-full border border-green-200/70 bg-white px-3 py-1 text-green-700 shadow-sm transition hover:border-green-400 hover:bg-green-50"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">{isRent ? "Rate" : "Price"}</p>
            <p className={`text-lg font-bold ${isRent ? "text-green-700" : "text-green-700"}`}>{priceDisplay}</p>
          </div>
          <span className="rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-700">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function ProductsExplorer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: "all", label: "All Products" },
  ]);

  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { items: cartItems, addToCart, removeFromCart } = useCart({ autoLoad: true });

  const allSuggestions = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.name) set.add(p.name);
      if (p.tags) p.tags.forEach(t => set.add(t));
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((p) => {
      (p.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 };
    const prices = products
      .map((p) => (p.listingType === "rent" ? p.rentPriceDay : p.basePrice))
      .filter((p): p is number => typeof p === "number");
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && data.categories) {
        const uniqueBySlug = new Map<string, { value: string; label: string }>();
        data.categories.forEach((cat: any) => {
          if (cat?.slug && !uniqueBySlug.has(cat.slug)) {
            uniqueBySlug.set(cat.slug, { value: cat.slug, label: cat.name });
          }
        });

        const categoryOptions = [
          { value: "all", label: "All Products" },
          ...Array.from(uniqueBySlug.values()),
        ];
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?all=true");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(term);
        const matchesDesc = product.description.toLowerCase().includes(term);
        const matchesTags = product.tags?.some(t => t.toLowerCase().includes(term));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      const price = product.listingType === "rent" ? product.rentPriceDay : product.basePrice;
      if (priceMin !== "" && typeof price === "number" && price < priceMin) return false;
      if (priceMax !== "" && typeof price === "number" && price > priceMax) return false;

      if (ratingFilter !== "" && product.rating) {
        if (product.rating.count === 0 || product.rating.average < ratingFilter) return false;
      } else if (ratingFilter !== "" && !product.rating) {
        return false;
      }

      if (selectedTags.length > 0) {
        const pTags = product.tags || [];
        if (!selectedTags.every(t => pTags.includes(t))) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, priceMin, priceMax, ratingFilter, selectedTags]);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
    const nextSearch = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      nextSearch.delete("category");
    } else {
      nextSearch.set("category", value);
    }
    router.replace(nextSearch.toString() ? `/services/products?${nextSearch.toString()}` : "/services/products", { scroll: false });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-sky-50 text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-green-600 via-green-500 to-lime-400 py-16 text-white">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-2 mt-5">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold sm:text-4xl">Travel Essentials & More</h1>
            <p className="mt-3 text-base text-white/80">
              Gear up for your next adventure with our curated selection of high-quality products for sale and rent.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
            <div className="relative flex items-center gap-4 text-gray-900"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setShowSuggestions(false);
                }
              }}
            >
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-green-500 relative z-10">
                <FaSearch className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products, gear, tags..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim()) {
                      const lower = val.toLowerCase();
                      const filtered = allSuggestions.filter(s => s.toLowerCase().includes(lower)).slice(0, 5);
                      setSuggestions(filtered);
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.trim()) setShowSuggestions(true);
                  }}
                  className="w-full bg-transparent outline-none placeholder:text-gray-500 text-black"
                  autoComplete="off"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-0 top-full mt-1 w-full rounded-xl border border-gray-100 bg-white py-2 shadow-lg ring-1 ring-black/5 z-20 overflow-hidden">
                  {suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}

              <button
                className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 transition shadow"
                onClick={() => setShowSuggestions(false)}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-2">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Explore Our Collection</h2>
            <p className="text-sm text-gray-600">Find the perfect gear for your travel needs.</p>
          </div>

          <CategoryTabs
            categories={categories}
            activeValue={selectedCategory}
            onChange={handleCategoryChange}
            accent="green"
            scrollable={false}
            className="flex flex-wrap items-center gap-2"
          />
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-wrap gap-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-green-100">
          {/* Price */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Price (₹)</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {([
                { key: "under-1000", label: "Under 1000", min: "" as const, max: 1000 as const },
                { key: "1000-plus", label: "1000+", min: 1000 as const, max: "" as const },
                { key: "5000-plus", label: "5000+", min: 5000 as const, max: "" as const },
              ] as const).map((p) => {
                const active = (priceMin === p.min || (p.min === "" && priceMin === "")) && (priceMax === p.max || (p.max === "" && priceMax === ""));
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setPriceMin(p.min);
                      setPriceMax(p.max);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${active ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                      }`}
                  >
                    <FaRupeeSign className="text-green-600" /> {p.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={priceMin === "" ? "" : priceMin}
                onChange={(e) => setPriceMin(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.min.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min={0}
                value={priceMax === "" ? "" : priceMax}
                onChange={(e) => setPriceMax(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                placeholder={priceBounds.max.toString()}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Rating</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {[
                { key: "4-plus", label: "4.0+", value: 4 },
                { key: "4-5-plus", label: "4.5+", value: 4.5 },
                { key: "5-star", label: "5.0", value: 5 },
              ].map((r) => {
                const active = ratingFilter !== "" && ratingFilter === r.value;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRatingFilter(r.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${active ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-yellow-400 hover:bg-yellow-50"
                      }`}
                  >
                    <FaStar className="text-yellow-500" /> {r.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setRatingFilter("")}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${ratingFilter === "" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                  }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">Popular tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <PageLoader fullscreen={false} className="py-20" />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-10">
            <FaShoppingCart className="mb-4 text-6xl text-gray-200" />
            <p className="text-lg text-gray-500 font-medium">No products found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setPriceMin("");
                setPriceMax("");
                setRatingFilter("");
                setSelectedTags([]);
                setSelectedCategory("all");
              }}
              className="mt-4 text-green-600 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-10">
            {filteredProducts.map((product) => {
              const isInCart = cartItems.some(
                (item) => item.itemId === product._id && item.itemType === "Product"
              );

              const handleAddToCart = async (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (product.variants && product.variants.length > 0) {
                  window.location.href = `/products/${product._id}`;
                  return;
                }

                try {
                  if (isInCart) {
                    const cartItem = cartItems.find(
                      (item) => item.itemId === product._id && item.itemType === "Product"
                    );
                    if (cartItem) {
                      await removeFromCart(cartItem._id);
                      toast.success(`${product.name} removed from cart!`);
                    }
                  } else {
                    await addToCart(product._id, "Product", 1);
                    toast.success(`${product.name} added to cart!`);
                  }
                } catch (err: any) {
                  toast.error(err.message || "Failed to manage cart");
                }
              };

              return (
                <ProductCard
                  key={product._id}
                  product={product}
                  isInCart={isInCart}
                  onAddToCart={handleAddToCart}
                  onSelectTag={(tag) => setSelectedTags(prev => prev.includes(tag) ? prev : [...prev, tag])}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

