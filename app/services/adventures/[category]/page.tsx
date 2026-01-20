import AdventuresExplorer from "../../../adventures/AdventuresExplorer";
import { ADVENTURE_CATEGORIES } from "../../../adventures/categories";

const VALID_CATEGORIES = ADVENTURE_CATEGORIES.map((tab) => tab.value);

export default async function ServicesAdventuresCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = VALID_CATEGORIES.includes(resolvedParams.category as any) ? resolvedParams.category : "all";
  return <AdventuresExplorer initialCategory={category} />;
}


