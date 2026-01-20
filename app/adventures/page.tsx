// app/adventures/page.tsx
import AdventuresExplorer from "@/app/adventures/AdventuresExplorer";

type AdventuresPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export default async function AdventuresPage({ searchParams }: AdventuresPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialCategory =
    typeof resolvedParams?.category === "string" ? resolvedParams.category : undefined;

  return <AdventuresExplorer initialCategory={initialCategory} />;
}