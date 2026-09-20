import type { Metadata } from "next";
import ProductDetailClient from "@/components/products/ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return { title: "Product not found" };
  }

  const description =
    product.description?.length > 160 ? `${product.description.slice(0, 157)}...` : product.description;

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.thumbnail ? [{ url: product.thumbnail }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
