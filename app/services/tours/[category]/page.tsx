import ToursExplorer from "../../../tours/ToursExplorer";
import { TOUR_CATEGORIES } from "../../../tours/categories";

const VALID_CATEGORIES = TOUR_CATEGORIES.map((tab) => tab.value);

export default async function ServicesToursCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = VALID_CATEGORIES.includes(params.category)
    ? params.category
    : "all";

  return <ToursExplorer initialCategory={category} />;
}


