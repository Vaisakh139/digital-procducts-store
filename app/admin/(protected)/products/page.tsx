"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import DeleteDialog from "@/components/admin/DeleteDialog";
import ProductForm from "@/components/admin/ProductForm";
import StatusBadge from "@/components/admin/StatusBadge";
import Button from "@/components/ui/Button";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useCategories } from "@/hooks/useCategories";
import { deleteProduct } from "@/services/adminProductService";
import { getDisplayPrice, type Product, type ProductStatus } from "@/types/storefront";

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "PUBLISHED"];

export default function AdminProductsPage() {
  const { products, loading, error, refresh } = useAdminProducts();
  const { categories } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "All">("All");

  const filtered = products.filter((product) => {
    const matchesCategory =
      categoryFilter === "All" || product.categoryId === categoryFilter;
    const matchesStatus = statusFilter === "All" || product.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const handleAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSaved = () => {
    setIsFormOpen(false);
    refresh();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: "image",
      header: "Image",
      render: (product) =>
        product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnailUrl}
            alt=""
            className="h-12 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-16 rounded-lg bg-surface-muted" />
        ),
    },
    {
      key: "title",
      header: "Title",
      render: (product) => (
        <div className="flex flex-col">
          <span className="font-medium">{product.title}</span>
          {product.isFeatured ? (
            <span className="text-xs text-brand-600">Featured</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product) => (
        <span className="text-foreground/70">{product.category.name}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product) => (
        <span className="font-medium">${getDisplayPrice(product).toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product) => <StatusBadge status={product.status} />,
    },
    {
      key: "downloads",
      header: "Downloads",
      render: (product) => (
        <span className="text-foreground/70">
          {product.downloadsCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (product) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEdit(product)}
            aria-label={`Edit ${product.title}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <Edit2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingProduct(product)}
            aria-label={`Delete ${product.title}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-foreground/60">
          Manage every product in your catalog.
        </p>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="h-4 w-4" aria-hidden="true" />}
          onClick={handleAdd}
        >
          Add Product
        </Button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={(product) => product.id}
        isLoading={loading}
        searchPlaceholder="Search products..."
        searchFn={(product, term) =>
          product.title.toLowerCase().includes(term) ||
          product.category.name.toLowerCase().includes(term)
        }
        emptyMessage="No products found."
        filters={
          <>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 rounded-full border border-border-subtle bg-surface px-4 text-sm outline-none focus:border-brand-500"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ProductStatus | "All")
              }
              className="h-10 rounded-full border border-border-subtle bg-surface px-4 text-sm capitalize outline-none focus:border-brand-500"
            >
              <option value="All">All Statuses</option>
              {PRODUCT_STATUSES.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
          </>
        }
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaved}
        product={editingProduct}
      />

      <DeleteDialog
        isOpen={Boolean(deletingProduct)}
        title="Delete product?"
        description={`This will permanently delete "${deletingProduct?.title}" along with its images and download file.`}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
}
