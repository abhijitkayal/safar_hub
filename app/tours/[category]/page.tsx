//tours/[category]/page.tsx
import { notFound } from "next/navigation";
import ToursExplorer from "../ToursExplorer";
import { TOUR_CATEGORIES } from "../categories";

type ToursCategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

// Generate static params for all valid categories
export async function generateStaticParams() {
  return TOUR_CATEGORIES.map((cat) => ({
    category: cat.value,
  }));
}

export default async function ToursCategoryPage({ params }: ToursCategoryPageProps) {
  const { category } = await params;
  
  // Check if it's a valid category
  const validCategories = TOUR_CATEGORIES.map(c => c.value);
  const isValidCategory = validCategories.includes(category as any);
  
  // If it looks like a MongoDB ID (24 hex chars), this route shouldn't match
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(category);
  
  if (isMongoId || !isValidCategory) {
    notFound();
  }
  
  return <ToursExplorer initialCategory={category} />;
}
