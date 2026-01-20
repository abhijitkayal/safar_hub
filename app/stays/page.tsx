//stays/page.tsx
import StaysExplorer from "./StaysExplorer";

type StaysPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export default async function StaysPage({ searchParams }: StaysPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialCategory =
    typeof resolvedParams?.category === "string" ? resolvedParams.category : undefined;

  return <StaysExplorer initialCategory={initialCategory} />;
}
