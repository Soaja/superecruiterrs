const unsplash = (id: string, w = 640) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

// TODO: temporary Unsplash photos — replace with real photos per service.
export const SERVICES = [
  { key: "headhunting", slug: "head-hunting", photo: unsplash("photo-1521791136064-7986c2920216"), tilt: -4 },
  { key: "audit", slug: "hr-revizija", photo: unsplash("photo-1552664730-d307ca884978"), tilt: 3 },
  { key: "mystery", slug: "mystery-guest", photo: unsplash("photo-1414235077428-338989a2e8c0"), tilt: -2 },
  { key: "training", slug: "trening-osoblja", photo: unsplash("photo-1556761175-5973dc0f32e7"), tilt: 4 },
  { key: "payroll", slug: "obracun-zarada", photo: unsplash("photo-1554224155-6726b3ff858f"), tilt: -3 },
] as const;

export type ServiceKey = (typeof SERVICES)[number]["key"];
