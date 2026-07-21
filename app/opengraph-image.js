import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#111827",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, color: "#fe4c1c" }}>{SITE_NAME}</div>
        <div style={{ maxWidth: 850, marginTop: 30, fontSize: 72, lineHeight: 1, fontWeight: 900 }}>
          Shop everyday products with confidence
        </div>
        <div style={{ maxWidth: 760, marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "#d1d5db" }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size
  );
}
