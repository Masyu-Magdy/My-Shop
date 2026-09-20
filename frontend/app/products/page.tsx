"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Slider, Pagination, MenuItem, Select, TextField, Drawer, IconButton } from "@mui/material";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { productService, categoryService } from "@/services/product.service";
import ProductCard from "@/components/products/ProductCard";
import { useDebounce } from "@/hooks/useDebounce";

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // Keep the URL in sync with every filter change, so the page stays shareable and refresh-safe.
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, category, sort, page, router]);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });

  const { data, isLoading } = useQuery({
    queryKey: ["products", { debouncedSearch, category, priceRange, sort, page }],
    queryFn: () =>
      productService.getAll({
        search: debouncedSearch || undefined,
        category: category || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort,
        page,
        limit: 12,
      }),
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPriceRange([0, 2000]);
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters = search || category || sort !== "newest";

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => setCategory("")}
            className={`block text-sm ${!category ? "text-(--color-primary) font-bold" : "text-gray-600"}`}
          >
            All categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategory(cat._id)}
              className={`block text-sm ${category === cat._id ? "text-(--color-primary) font-bold" : "text-gray-600"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Price range</h3>
        <Slider
          value={priceRange}
          onChange={(_, val) => setPriceRange(val as number[])}
          valueLabelDisplay="auto"
          min={0}
          max={2000}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
      {/* Sidebar Filters - desktop only */}
      <aside className="hidden md:block">{FilterPanel}</aside>

      {/* Mobile filters drawer */}
      <Drawer anchor="bottom" open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Filters</h2>
            <IconButton onClick={() => setFiltersOpen(false)}>
              <X size={20} />
            </IconButton>
          </div>
          {FilterPanel}
          <button
            onClick={() => setFiltersOpen(false)}
            className="w-full mt-6 bg-(--color-primary) text-white font-semibold py-3 rounded-full"
          >
            Show results
          </button>
        </div>
      </Drawer>

      {/* Main Content */}
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <TextField
            fullWidth
            size="small"
            placeholder="Search for a product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <Search size={18} className="mr-2 text-gray-400" /> } }}
          />
          <button
            onClick={() => setFiltersOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium shrink-0"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <Select size="small" value={sort} onChange={(e) => setSort(e.target.value)} className="min-w-[180px] shrink-0">
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="price_asc">Price: low to high</MenuItem>
            <MenuItem value="price_desc">Price: high to low</MenuItem>
            <MenuItem value="rating">Top rated</MenuItem>
            <MenuItem value="discount">Biggest discount</MenuItem>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {search && (
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                Search: {search} <X size={12} className="cursor-pointer" onClick={() => setSearch("")} />
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-(--color-primary) font-semibold">
              Clear all filters
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">
          {isLoading ? "Loading..." : `Showing ${data?.items.length || 0} of ${data?.pagination.total || 0} products`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold">No matching products</p>
            <button onClick={clearFilters} className="mt-3 text-(--color-primary) font-semibold">
              Clear filters and try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data?.items.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {data && data.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  count={data.pagination.totalPages}
                  page={page}
                  onChange={(_, val) => setPage(val)}
                  color="primary"
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
