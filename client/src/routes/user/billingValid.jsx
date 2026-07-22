import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { validateBilling } from "../../libs/api/api.endpoints";

export default function Billing() {
  const { type, subType, duration } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["validateBilling", type, subType, duration],
    queryFn: () => {
      const reference = new URL(window.location.href).searchParams.get("trxref");
      return validateBilling(`/${type}/${subType}/${duration}/:autoRenew?tx_ref=${reference}`);
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  useEffect(() => { if (query.isSuccess) queryClient.invalidateQueries({ queryKey: ["billing-page-v2"] }); }, [query.isSuccess, queryClient]);
  return <main className={`paymentStatusV3 ${query.isError ? "error" : ""}`}>
    <Icon icon={query.isLoading ? "solar:refresh-circle-linear" : query.isError ? "solar:danger-circle-linear" : "solar:check-circle-linear"}/>
    <small>{query.isLoading ? "VERIFYING PAYMENT" : query.isError ? "PAYMENT NEEDS ATTENTION" : "PAYMENT CONFIRMED"}</small>
    <h1>{query.isLoading ? "Checking your payment…" : query.isError ? query.error.message : query.data?.message || "You’re all set."}</h1>
    <p>{query.isLoading ? "Keep this page open while ATP confirms the transaction." : query.isError ? "Your membership was not changed. Try again or contact ATP support." : "Your player account has been updated and a confirmation is on its way."}</p>
    {!query.isLoading && <Link to={query.isError ? "/u/billings" : "/u"}>{query.isError ? "Return to billing" : "Back to dashboard"}<Icon icon="solar:arrow-right-linear"/></Link>}
  </main>;
}
