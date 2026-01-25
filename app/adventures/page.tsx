// app/adventures/page.tsx
import { redirect } from "next/navigation";

type AdventuresPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function AdventuresPage({ searchParams }: AdventuresPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  
  // Build query string if there are any search params besides category
  const params = new URLSearchParams();
  if (resolvedParams) {
    Object.entries(resolvedParams).forEach(([key, value]) => {
      if (key !== 'category' && value !== undefined) {
        const stringValue = Array.isArray(value) ? value[0] : value;
        params.set(key, stringValue);
      }
    });
  }
  
  const category = typeof resolvedParams?.category === "string" ? resolvedParams.category : "all";
  const queryString = params.toString();
  const redirectPath = queryString ? `/adventures/${category}?${queryString}` : `/adventures/${category}`;
  
  redirect(redirectPath);
}

