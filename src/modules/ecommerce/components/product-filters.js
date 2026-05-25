"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export function ProductFilters({ search, setSearch, category, setCategory, sortBy, setSortBy, categories, onReset, onlyFeatured, setOnlyFeatured }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_0.9fr_auto]">
      <Input placeholder="Search products" value={search} onChange={(event) => setSearch(event.target.value)} />
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
      >
        <option value="all">All categories</option>
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
      >
        <option value="featured">Featured first</option>
        <option value="price-low">Price: low to high</option>
        <option value="price-high">Price: high to low</option>
        <option value="rating">Rating</option>
      </select>
      <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
        <input type="checkbox" checked={onlyFeatured} onChange={(event) => setOnlyFeatured(event.target.checked)} />
        Featured only
      </label>
      <Button variant="secondary" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}