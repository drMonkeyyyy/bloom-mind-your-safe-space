import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
    queryFn: async () => {
      if (!userId) return null;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (!profile) return null;

      // Check if user has active premium via profile dates or plan
      let isPrem = profile.plan === "premium";
      let endDate = profile.premium_end_date ? new Date(profile.premium_end_date) : null;
      if (endDate && endDate > new Date()) {
        isPrem = true;
      }

      // Fallback: If profile says free or missing dates, check approved orders in 'orders' table
      if (!isPrem) {
        const { data: approvedOrders } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .eq("payment_status", "disetujui")
          .order("created_at", { ascending: false });

        if (approvedOrders && approvedOrders.length > 0) {
          const latestOrder = approvedOrders[0];
          const orderDate = new Date(latestOrder.verified_at || latestOrder.created_at);
          const computedEnd = new Date(orderDate);
          const pkg = latestOrder.package_name || "";

          if (pkg.includes("Tahunan") || pkg.includes("1 Tahun") || pkg.includes("365")) {
            computedEnd.setDate(computedEnd.getDate() + 365);
          } else if (pkg.includes("90") || pkg.includes("3 Bulan") || pkg.includes("Pemulihan Utuh")) {
            computedEnd.setDate(computedEnd.getDate() + 90);
          } else if (pkg.includes("7") || pkg.includes("Mingguan")) {
            computedEnd.setDate(computedEnd.getDate() + 7);
          } else {
            computedEnd.setDate(computedEnd.getDate() + 30);
          }

          if (computedEnd > new Date()) {
            profile.plan = "premium";
            profile.premium_start_date = orderDate.toISOString();
            profile.premium_end_date = computedEnd.toISOString();

            // Self-heal profile in DB asynchronously
            supabase
              .from("profiles")
              .update({
                plan: "premium",
                premium_start_date: orderDate.toISOString(),
                premium_end_date: computedEnd.toISOString(),
              })
              .eq("id", userId)
              .then(() => {});
          }
        }
      }

      return profile;
    },
  });
}

export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["role", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      return (data ?? []).some((r) => r.role === "admin");
    },
  });
}
