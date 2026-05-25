"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { useCartStore } from "@/modules/ecommerce/store/use-cart-store";
import { useWishlistStore } from "@/modules/ecommerce/store/use-wishlist-store";
import { usePermissionContext } from "@/modules/rbac/provider/permission-provider";

export function ProductCard({ product, onEdit, onDelete, actionState }) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { can } = usePermissionContext();

  const canEditProducts = can("products:edit");
  const canDeleteProducts = can("products:delete");
  const canManageCart = can("cart:manage");
  const isInCart = cartItems.some((item) => item.id === product.id);
  const isInWishlist = wishlistItems.some((item) => item.id === product.id);
  const isBusy = actionState?.productId === product.id;
  const isDeleting = isBusy && actionState?.type === "delete";

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
          {product.featured ? <Badge className="bg-sky-100 text-sky-700">Featured</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-slate-500">{product.category}</p>
        <p className="mt-4 text-2xl font-semibold text-slate-950">${product.price}</p>
        <p className="mt-1 text-sm text-slate-600">Rating: {product.rating}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {isInCart ? <Badge className="bg-emerald-100 text-emerald-700">In cart</Badge> : null}
          {isInWishlist ? <Badge className="bg-amber-100 text-amber-700">Wishlisted</Badge> : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          onClick={() => addItem(product)}
          disabled={!canManageCart}
          title={canManageCart ? "Add to cart" : "Need cart:manage permission"}
        >
          Add to cart
        </Button>
        <Button variant="secondary" onClick={() => toggleItem(product)}>
          {isInWishlist ? "Remove wishlist" : "Wishlist"}
        </Button>
        <Button
          variant="ghost"
          disabled={!canEditProducts || isBusy}
          onClick={onEdit}
          title={canEditProducts ? "Edit" : "Need products:edit permission"}
        >
          Edit
        </Button>
        {canDeleteProducts ? (
          <Button variant="ghost" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}