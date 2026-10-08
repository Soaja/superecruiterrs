import type { FlagCode } from "@/components/ui/Flag";
import type { CityKey } from "@/lib/map-data";

export type NetworkCountry = {
  code: FlagCode;
  city: CityKey;
  /**
   * Arc curvature toward Belgrade, as a fraction of the arc length. Tuned per
   * route so arcs fan out instead of tangling; negative bows the other way.
   */
  bend: number;
};

/** Order = chip order = auto-cycle order. */
export const NETWORK: NetworkCountry[] = [
  { code: "nepal", city: "kathmandu", bend: 0.34 },
  { code: "indonesia", city: "jakarta", bend: 0.3 },
  { code: "uzbekistan", city: "tashkent", bend: 0.2 },
  { code: "kenya", city: "nairobi", bend: -0.22 },
  { code: "uae", city: "dubai", bend: 0.14 },
  { code: "india", city: "newDelhi", bend: 0.22 },
];

export const DEFAULT_COUNTRY = 0;
