import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// TODO: replace with the real logo mark once the SVG logo arrives.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF6A1A",
          color: "#1E1814",
          fontSize: 120,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        S
      </div>
    ),
    size,
  );
}
