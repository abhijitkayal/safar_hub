import { notFound } from "next/navigation";
import ToursExplorer from "../../../tours/ToursExplorer";
import { TOUR_CATEGORIES } from "../../../tours/categories";

type AdminToursCategoryPageProps = {
  params: Promise<{ category: string }>;
};

// Generate static params for all valid categories
export async function generateStaticParams() {
  return TOUR_CATEGORIES.map((cat) => ({
    category: cat.value,
  }));
}

export default async function ToursCategoryPage({ params }: AdminToursCategoryPageProps) {
  const { category } = await params;

  // Validate category
  const isValidCategory = TOUR_CATEGORIES.map((c) => c.value).includes(category as any);

  const isMongoId = /^[0-9a-fA-F]{24}$/.test(category);
  if (isMongoId || !isValidCategory) {
    notFound();
  }

  return <ToursExplorer initialCategory={category} />;
}
