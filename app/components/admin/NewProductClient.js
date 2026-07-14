"use client";

import { useRouter } from "next/navigation";
import ProductForm from "./ProductForm";
import { addProductAction } from "@/app/actions/admin";

export default function NewProductClient({ categories }) {
  const router = useRouter();

  async function handleSubmit(payload) {
    await addProductAction(payload);
    router.push("/admin/products");
  }

  return <ProductForm categories={categories} onSubmit={handleSubmit} />;
}
