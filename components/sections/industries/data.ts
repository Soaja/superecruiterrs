import { ChefHat, HardHat, Truck, type LucideIcon } from "lucide-react";

export type IndustryKey = "hospitality" | "logistics" | "construction";

export type Industry = {
  key: IndustryKey;
  /** Value for the contact form preselect: ?industrija=<slug> */
  slug: string;
  icon: LucideIcon;
  /** TODO: temporary Unsplash photos — replace with real client photos. */
  photo: string;
  /** object-position for the photo crop */
  focus: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const INDUSTRIES: Industry[] = [
  {
    key: "hospitality",
    slug: "hotelijerstvo",
    icon: ChefHat,
    photo: unsplash("photo-1565608087341-404b25492fee"),
    focus: "50% 40%",
  },
  {
    key: "logistics",
    slug: "logistika",
    icon: Truck,
    photo: unsplash("photo-1601584115197-04ecc0da31d7"),
    focus: "35% 60%",
  },
  {
    key: "construction",
    slug: "gradjevinarstvo",
    icon: HardHat,
    photo: unsplash("photo-1589939705384-5185137a7f0f"),
    focus: "70% 45%",
  },
];

export const DEFAULT_INDUSTRY = 0;
