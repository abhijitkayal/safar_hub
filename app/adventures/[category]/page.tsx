import AdventuresExplorer from "../AdventuresExplorer";
import { ADVENTURE_CATEGORIES } from "../categories";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    category: string;
  }>;
};

const VALID_CATEGORIES = ADVENTURE_CATEGORIES.map(
  (cat) => cat.value
);

export async function generateStaticParams() {
  return ADVENTURE_CATEGORIES.map((cat) => ({
    category: cat.value,
  }));
}

export default async function AdventureCategoryPage({ params }: PageProps) {
  const { category } = await params;

  // If it looks like a MongoDB ID (24 hex chars), this route shouldn't match
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(category);
  
  // ❌ If category is invalid → 404
  if (isMongoId || !VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  return (
    <AdventuresExplorer category={category} />
  );
}
