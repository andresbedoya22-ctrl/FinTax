import { TaxReturnFlow } from "@/components/fintax/flows";

export default async function TaxReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return <TaxReturnFlow initialService={service} />;
}
