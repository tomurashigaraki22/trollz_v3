"use client";

import { useRouter } from "next/navigation";
import ProductForm from "./ProductForm";
import { updateProductAction } from "@/app/actions/admin";

export default function EditProductClient({ product, categories }) {
  const router = useRouter();

  async function handleSubmit(payload) {
    await updateProductAction(product.id, payload);
    router.push("/admin/products");
  }

  return <ProductForm product={product} categories={categories} onSubmit={handleSubmit} />;
}
