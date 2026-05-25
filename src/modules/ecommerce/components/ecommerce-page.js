"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { ProductCard } from "@/modules/ecommerce/components/product-card";
import { ProductFilters } from "@/modules/ecommerce/components/product-filters";
import { useProducts } from "@/modules/ecommerce/hooks/use-products";
import { useCartStore } from "@/modules/ecommerce/store/use-cart-store";
import { useWishlistStore } from "@/modules/ecommerce/store/use-wishlist-store";
import { usePermissionContext } from "@/modules/rbac/provider/permission-provider";
import {
  applyCouponCode,
  createProduct,
  deleteProduct,
  simulatePaymentDecision,
  updateProduct,
} from "@/modules/ecommerce/services/commerce-service";

const emptyProductForm = {
  name: "",
  category: "",
  price: "",
  rating: "",
  featured: false,
};

const couponDiscounts = {
  SAVE10: 10,
  SAVE20: 20,
  BUYMORE: 15,
};

const CATALOG_STORAGE_KEY = "ecommerce-catalog";

function readStoredCatalog() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawCatalog = window.localStorage.getItem(CATALOG_STORAGE_KEY);
  if (!rawCatalog) {
    return null;
  }

  try {
    const parsedCatalog = JSON.parse(rawCatalog);
    return Array.isArray(parsedCatalog) ? parsedCatalog : null;
  } catch {
    return null;
  }
}

export function EcommercePage() {
  const { data = [], isLoading, error } = useProducts();
  const { can, role } = usePermissionContext();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeCartItem = useCartStore((state) => state.removeItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const canCreateProducts = can("products:add");
  const canEditProducts = can("products:edit");
  const canDeleteProducts = can("products:delete");
  const canManageCart = can("cart:manage");
  const canCheckoutSimulate = can("checkout:simulate");
  const canApplyCoupon = can("checkout:coupon");
  const canPurchase = can("checkout:purchase");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [catalogReady, setCatalogReady] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [catalogActionState, setCatalogActionState] = useState({ status: "idle", type: "", productId: null, message: "" });
  const [couponState, setCouponState] = useState({ status: "idle", message: "", code: "", discount: 0, totalAfterDiscount: 0 });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState("success");
  const [paymentState, setPaymentState] = useState({ status: "idle", outcome: "", message: "" });

  useEffect(() => {
    if (catalogReady || !data.length) return;

    // Always use the mock products fetched by `useProducts()` as the authoritative source
    setCatalog(data);
    setCatalogReady(true);
  }, [data, catalogReady]);

  useEffect(() => {
    if (!catalogReady) {
      return;
    }

    window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
  }, [catalog, catalogReady]);

  const categories = useMemo(() => [...new Set(catalog.map((product) => product.category))], [catalog]);

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const wishlistPreview = wishlistItems.slice(0, 3);

  const recommendationGroups = useMemo(() => {
    if (cartItems.length === 0) return [];

    const accessoryMap = {
      Mobile: ["Mobile Accessories"],
      Laptop: ["Laptop Accessories"],
    };

    const cartCategories = Array.from(new Set(cartItems.map((c) => c.category)));

    const groups = cartCategories.map((cat) => {
      const targetCats = accessoryMap[cat] ?? [];
      const items = catalog.filter((p) => targetCats.includes(p.category) && !cartItems.some((ci) => ci.id === p.id));
      return { title: `Recommended for ${cat}`, items };
    }).filter((g) => g.items.length > 0);

    // fallback: if no category-specific groups, show featured/high-rated as a single group
    if (groups.length === 0) {
      const featured = catalog.filter((product) => product.featured && !cartItems.some((cartItem) => cartItem.id === product.id));
      const sortedByRating = [...catalog]
        .filter((product) => !cartItems.some((cartItem) => cartItem.id === product.id))
        .sort((left, right) => right.rating - left.rating);
      const candidates = [...featured, ...sortedByRating].filter((product, index, array) => array.findIndex((item) => item.id === product.id) === index);
      return [{ title: "Recommended for you", items: candidates.slice(0, 4) }];
    }

    // limit each group to 4 items
    return groups.map((g) => ({ title: g.title, items: g.items.slice(0, 4) }));
  }, [catalog, cartItems]);

  // Pagination: page size is configurable
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const activeCouponDiscount = couponState.status === "success" ? couponState.discount : 0;
  const discountAmount = Math.round((cartTotal * activeCouponDiscount) / 100);
  const payableTotal = cartTotal - discountAmount;

  const filteredProducts = useMemo(() => {
    const filtered = catalog.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" ? true : product.category === category;
      const matchesFeatured = onlyFeatured ? product.featured : true;
      return matchesSearch && matchesCategory && matchesFeatured;
    });
    const sorted = [...filtered];

    if (sortBy === "price-low") {
      sorted.sort((left, right) => left.price - right.price);
    }

    if (sortBy === "price-high") {
      sorted.sort((left, right) => right.price - left.price);
    }

    if (sortBy === "rating") {
      sorted.sort((left, right) => right.rating - left.rating);
    }

    if (sortBy === "featured") {
      sorted.sort((left, right) => Number(right.featured) - Number(left.featured));
    }

    return sorted;
  }, [catalog, search, category, sortBy, onlyFeatured]);

  // reset pagination when the filtered products list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const saveProduct = async () => {
    const nextProduct = {
      id: editingProductId ?? Date.now(),
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price: Number(productForm.price),
      rating: Number(productForm.rating),
      featured: productForm.featured,
    };

    if (!nextProduct.name || !nextProduct.category || Number.isNaN(nextProduct.price) || Number.isNaN(nextProduct.rating)) {
      return;
    }

    if (!editingProductId && !canCreateProducts) {
      return;
    }

    if (editingProductId && !canEditProducts) {
      return;
    }

    const actionType = editingProductId ? "update" : "create";

    setCatalogActionState({
      status: "loading",
      type: actionType,
      productId: nextProduct.id,
      message: actionType === "update" ? "Saving product update..." : "Adding product...",
    });

    try {
      const response = editingProductId ? await updateProduct(nextProduct) : await createProduct(nextProduct);
      setCatalog(response.catalog);
      setProductForm(emptyProductForm);
      setEditingProductId(null);
      setCatalogActionState({
        status: "success",
        type: actionType,
        productId: nextProduct.id,
        message: response.message,
      });
    } catch {
      setCatalogActionState({
        status: "error",
        type: actionType,
        productId: nextProduct.id,
        message: "Unable to save the product right now.",
      });
    }
  };

  const startEditProduct = (product) => {
    if (!canEditProducts) return;

    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      rating: String(product.rating),
      featured: product.featured,
    });
  };

  const deleteCatalogProduct = async (productId) => {
    if (!canDeleteProducts) return;

    setCatalogActionState({
      status: "loading",
      type: "delete",
      productId,
      message: "Deleting product...",
    });

    try {
      const response = await deleteProduct(productId);
      setCatalog(response.catalog);
      if (editingProductId === productId) {
        setEditingProductId(null);
        setProductForm(emptyProductForm);
      }
      setCatalogActionState({
        status: "success",
        type: "delete",
        productId,
        message: response.message,
      });
    } catch {
      setCatalogActionState({
        status: "error",
        type: "delete",
        productId,
        message: "Unable to delete the product right now.",
      });
    }
  };

  const applyCoupon = async () => {
    if (!canApplyCoupon) return;
    const normalizedCode = couponCode.trim().toUpperCase();

    setCouponState({
      status: "loading",
      message: "Applying coupon...",
      code: normalizedCode,
      discount: 0,
      totalAfterDiscount: cartTotal,
    });

    try {
      const response = await applyCouponCode({ code: normalizedCode, total: cartTotal });
      setAppliedCoupon(response.applied ? response.code : null);
      setCouponState({
        status: response.applied ? "success" : "error",
        message: response.message,
        code: response.code,
        discount: response.discount,
        totalAfterDiscount: response.totalAfterDiscount,
      });
    } catch {
      setAppliedCoupon(null);
      setCouponState({
        status: "error",
        message: "Unable to apply the coupon right now.",
        code: normalizedCode,
        discount: 0,
        totalAfterDiscount: cartTotal,
      });
    }
  };

  const openPaymentModal = () => {
    if (!canCheckoutSimulate || !canPurchase || cartItems.length === 0) return;

    setPaymentChoice("success");
    setPaymentState({ status: "idle", outcome: "", message: "" });
    setPaymentModalOpen(true);
  };

  const simulatePayment = async () => {
    if (!canCheckoutSimulate || !canPurchase || cartItems.length === 0) {
      setPaymentState({
        status: "failure",
        outcome: "failure",
        message: "Add items to cart before payment.",
      });
      return;
    }

    setPaymentState({ status: "loading", outcome: paymentChoice, message: "Processing payment..." });

    try {
      const response = await simulatePaymentDecision({
        outcome: paymentChoice,
        total: payableTotal,
        couponCode: appliedCoupon,
      });

      setPaymentState({
        status: response.outcome === "success" ? "success" : "failure",
        outcome: response.outcome,
        message: response.message,
      });
    } catch {
      setPaymentState({
        status: "failure",
        outcome: "failure",
        message: "Unable to process the payment simulation right now.",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Ecommerce Frontend</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Products, filters, cart, and wishlist</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="!bg-emerald-100 !text-emerald-700 ring-1 ring-inset ring-emerald-200">Role: {role}</Badge>
            <Badge>Catalog: {catalog.length}</Badge>
            <Badge>Cart: {cartItems.length}</Badge>
            <Badge>Wishlist: {wishlistItems.length}</Badge>
            <Badge>Total: ${cartTotal}</Badge>
            {activeCouponDiscount ? <Badge>Coupon applied: {appliedCoupon} (-{activeCouponDiscount}%)</Badge> : null}
            {catalogActionState.status === "loading" ? <Badge>Saving catalog...</Badge> : null}
            {catalogActionState.status === "success" ? <Badge className="bg-emerald-100 text-emerald-700">{catalogActionState.message}</Badge> : null}
          </div>
        </div>
      </Card>

      {(canCreateProducts || canEditProducts || canDeleteProducts) ? (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Catalog management</h2>
              <p className="mt-1 text-sm text-slate-600">Inline add, edit, and delete actions are driven by permissions.</p>
            </div>
            <Badge className={canCreateProducts ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
              {editingProductId ? "Editing product" : canCreateProducts ? "Can add products" : canEditProducts ? "Edit only" : "Read only"}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input
              value={productForm.name}
              onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Product name"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
            />
            <input
              value={productForm.category}
              onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Category"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
            />
            <input
              value={productForm.price}
              onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
              placeholder="Price"
              type="number"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
            />
            <input
              value={productForm.rating}
              onChange={(event) => setProductForm((current) => ({ ...current, rating: event.target.value }))}
              placeholder="Rating"
              type="number"
              step="0.1"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
            />
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))}
              />
              Featured
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {editingProductId ? (
              <Button onClick={saveProduct} disabled={catalogActionState.status === "loading"}>
                {catalogActionState.status === "loading" && catalogActionState.type === "update" ? "Saving..." : "Save product"}
              </Button>
            ) : canCreateProducts ? (
              <Button onClick={saveProduct} disabled={catalogActionState.status === "loading"}>
                {catalogActionState.status === "loading" && catalogActionState.type === "create" ? "Adding..." : "Add product"}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => {
                setEditingProductId(null);
                setProductForm(emptyProductForm);
              }}
            >
              Clear form
            </Button>
          </div>
        </Card>
      ) : null}

      <Card>
        <ProductFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          onReset={() => {
            setSearch("");
            setCategory("all");
            setSortBy("featured");
            setOnlyFeatured(false);
          }}
          onlyFeatured={onlyFeatured}
          setOnlyFeatured={setOnlyFeatured}
        />
          <div className="mt-3 flex items-center justify-end gap-2">
            <label className="text-sm text-slate-600">Products per page:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-4">
          {isLoading ? <Card>Loading products...</Card> : null}
          {error ? <Card>Failed to load products.</Card> : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => startEditProduct(product)}
                onDelete={() => deleteCatalogProduct(product.id)}
                actionState={catalogActionState}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                Prev
              </Button>
              <div className="px-3 py-2 text-sm text-slate-700">Page {currentPage}/{totalPages}</div>
              <Button variant="ghost" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4 sticky top-24">
            <Card>
            <h2 className="text-lg font-semibold text-slate-950">Cart summary</h2>
            <p className="mt-2 text-sm text-slate-600">Quantity, subtotal, and direct item controls.</p>
            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">${item.price} each</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">x{item.quantity}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => incrementItem(item.id)} disabled={!canManageCart}>
                      +
                    </Button>
                    <Button variant="secondary" onClick={() => decrementItem(item.id)} disabled={!canManageCart}>
                      -
                    </Button>
                    <Button variant="ghost" onClick={() => removeCartItem(item.id)} disabled={!canManageCart}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {cartItems.length === 0 ? <p className="text-sm text-slate-500">Cart is empty.</p> : null}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-sm font-medium text-slate-700">Subtotal</p>
              <p className="text-lg font-semibold text-slate-950">${cartTotal}</p>
            </div>
            <Button className="mt-4 w-full" variant="secondary" onClick={clearCart} disabled={!canManageCart}>
              Clear cart
            </Button>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-950">Checkout and recommendations</h2>
            <p className="mt-2 text-sm text-slate-600">User accounts can purchase, apply coupons, and simulate payment here.</p>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Coupon code"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
                />
                <Button variant="secondary" onClick={applyCoupon} disabled={!canApplyCoupon || couponState.status === "loading"}>
                  {couponState.status === "loading" ? "Applying..." : "Apply coupon"}
                </Button>
              </div>

              {couponState.message ? (
                <Badge className={couponState.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                  {couponState.message}
                </Badge>
              ) : null}

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">Total after coupon</p>
                  <p className="text-lg font-semibold text-slate-950">${payableTotal}</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Payment simulation status: {paymentState.status === "idle" ? "ready" : paymentState.status}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={openPaymentModal} disabled={!canCheckoutSimulate || !canPurchase || cartItems.length === 0}>
                    Simulate payment
                  </Button>
                  <Button variant="secondary" onClick={() => setPaymentState({ status: "idle", outcome: "", message: "" })}>
                    Reset
                  </Button>
                </div>
              </div>

              {cartItems.length > 0 ? (
                <>
                  {recommendationGroups.map((group) => (
                    <div key={group.title} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{group.title}</p>
                      <div className="mt-3 space-y-2">
                        {group.items.map((product) => (
                          <div key={product.id} className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-700">{product.name}</span>
                            <span className="text-sm font-medium text-slate-900">${product.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Add items to the cart to unlock recommendations.</div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">Wishlist</h2>
              <Button variant="ghost" onClick={clearWishlist}>
                Clear
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {wishlistPreview.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-sm text-slate-700">{item.name}</p>
                  <Button variant="ghost" onClick={() => removeWishlistItem(item.id)}>
                    Remove
                  </Button>
                </div>
              ))}
              {wishlistItems.length === 0 ? <p className="text-sm text-slate-500">Wishlist is empty.</p> : null}
            </div>
            </Card>
          </div>
        </div>
      </div>

      {paymentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Payment simulation</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">Force the checkout outcome</h3>
                <p className="mt-2 text-sm text-slate-600">Pick success or failure, then wait for the 2 second loader.</p>
              </div>
              <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="radio"
                  name="payment-choice"
                  value="success"
                  checked={paymentChoice === "success"}
                  onChange={() => setPaymentChoice("success")}
                />
                Force success
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="radio"
                  name="payment-choice"
                  value="failure"
                  checked={paymentChoice === "failure"}
                  onChange={() => setPaymentChoice("failure")}
                />
                Force failure
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-4">
              {paymentState.status === "loading" ? (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  Processing payment...
                </div>
              ) : paymentState.message ? (
                <Badge className={paymentState.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                  {paymentState.message}
                </Badge>
              ) : (
                <p className="text-sm text-slate-500">Choose an outcome, then confirm.</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={simulatePayment} disabled={paymentState.status === "loading"}>
                {paymentState.status === "loading" ? "Submitting..." : "Confirm payment"}
              </Button>
              <Button variant="secondary" onClick={() => setPaymentModalOpen(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </div>
  );
}