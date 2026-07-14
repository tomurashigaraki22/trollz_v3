import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/queries/products";

// Used by the client-side Cart/Wishlist providers to resolve real product
// details for the ids they've persisted to localStorage (a browser can't
// query MySQL directly).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ products: [] });
  }

  const ids = idsParam
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value));

  const products = await getProductsByIds(ids);
  return NextResponse.json({ products });
}
