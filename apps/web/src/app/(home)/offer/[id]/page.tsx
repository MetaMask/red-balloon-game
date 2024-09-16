import { redirect } from "next/navigation";
import { type Hex } from "redballoon-contract-api";

export default async function OfferPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { pk?: Hex };
}) {
  const pkParam = searchParams.pk ? `&pk=${searchParams.pk}` : "";
  redirect(`/balloons?offer=${params.id}${pkParam}`);
}
