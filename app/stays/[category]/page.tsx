//stays/[category]/page.tsx
import { notFound } from "next/navigation";
import StaysExplorer from "../StaysExplorer";
import { STAY_CATEGORIES } from "../categories";

type StaysCategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

// This prevents Next.js from matching MongoDB ObjectId patterns
export async function generateStaticParams() {
  return STAY_CATEGORIES.map((cat) => ({
    category: cat.value,
  }));
}

export default async function StaysCategoryPage({ params }: StaysCategoryPageProps) {
  const { category } = await params;
  
  // Check if it's a valid category
  const validCategories = STAY_CATEGORIES.map(c => c.value);
  const isValidCategory = validCategories.includes(category as any);
  
  // If it looks like a MongoDB ID (24 hex chars), this route shouldn't match
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(category);
  
  if (isMongoId || !isValidCategory) {
    notFound();
  }
  
  return <StaysExplorer initialCategory={category} />;
}
