// tours/page.tsx
import ToursExplorer from "./ToursExplorer";

type ToursPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export default async function ToursPage({ searchParams }: ToursPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialCategory =
    typeof resolvedParams?.category === "string" ? resolvedParams.category : undefined;

  return <ToursExplorer initialCategory={initialCategory} />;
}