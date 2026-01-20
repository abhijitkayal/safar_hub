import StaysExplorer from "../../../stays/StaysExplorer";
import { STAY_CATEGORIES } from "../../../stays/categories";

const VALID_CATEGORIES = STAY_CATEGORIES.map((tab) => tab.value);

export default async function ServicesStaysCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = VALID_CATEGORIES.includes(resolvedParams.category as any) ? resolvedParams.category : "all";
  return <StaysExplorer initialCategory={category} />;
}
