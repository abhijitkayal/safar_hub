//stays/page.tsx
import { redirect } from "next/navigation";

type StaysPageProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function StaysPage({ searchParams }: StaysPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  
  // Build query string if there are any search params
  const params = new URLSearchParams();
  if (resolvedParams) {
    Object.entries(resolvedParams).forEach(([key, value]) => {
      if (value !== undefined) {
        const stringValue = Array.isArray(value) ? value[0] : value;
        params.set(key, stringValue);
      }
    });
  }
  
  const queryString = params.toString();
  const redirectPath = queryString ? `/stays/all?${queryString}` : "/stays/all";
  
  redirect(redirectPath);
}
