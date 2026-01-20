import ToursExplorer from "../../../tours/ToursExplorer";
import { TOUR_CATEGORIES } from "../../../tours/categories";

const VALID_CATEGORIES = TOUR_CATEGORIES.map((tab) => tab.value);

export default async function ServicesToursCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = VALID_CATEGORIES.includes(resolvedParams.category as any) ? resolvedParams.category : "all";
  return <ToursExplorer initialCategory={category} />;
}


