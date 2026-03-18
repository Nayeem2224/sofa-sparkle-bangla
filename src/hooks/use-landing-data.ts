import { useQuery } from "@tanstack/react-query";
import { fetchSiteSettings, fetchActivePackages, fetchActiveAddOns, fetchActiveTimeSlots } from "@/lib/api";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["service-packages"],
    queryFn: fetchActivePackages,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddOns() {
  return useQuery({
    queryKey: ["booking-add-ons"],
    queryFn: fetchActiveAddOns,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTimeSlots() {
  return useQuery({
    queryKey: ["time-slots"],
    queryFn: fetchActiveTimeSlots,
    staleTime: 5 * 60 * 1000,
  });
}
