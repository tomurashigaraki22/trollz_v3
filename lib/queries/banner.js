import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

const DEFAULT_BUTTON = {
  label: "Shop now",
  href: "/shop",
  x: 82,
  y: 80,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function safeJsonArray(value) {
  const parsed = Array.isArray(value) ? value : parseJson(value);
  return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
}

function isSafeMediaUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSafeButtonHref(value) {
  const href = String(value ?? "").trim();
  if (!href) return true;
  if (href.startsWith("/")) return !href.startsWith("//");
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeButton(value) {
  const source = value && typeof value === "object" ? value : DEFAULT_BUTTON;
  const label = String(source.label ?? "").trim().slice(0, 40);
  const rawHref = String(source.href ?? "").trim().slice(0, 2048);
  const href = isSafeButtonHref(rawHref) ? rawHref : DEFAULT_BUTTON.href;
  const x = Number(source.x);
  const y = Number(source.y);

  return {
    label,
    href,
    x: Number.isFinite(x) ? Math.round(clamp(x, 5, 95) * 10) / 10 : DEFAULT_BUTTON.x,
    y: Number.isFinite(y) ? Math.round(clamp(y, 5, 95) * 10) / 10 : DEFAULT_BUTTON.y,
  };
}

function normalizeSlide(value, fallbackId) {
  if (!value || typeof value !== "object") return null;
  const url = String(value.url ?? "").trim();
  if (!url || !isSafeMediaUrl(url)) return null;

  const type = value.type === "video" ? "video" : "image";
  const mime = type === "video" ? String(value.mime || "video/mp4").toLowerCase() : null;
  const duration = Number(value.duration);

  return {
    id: String(value.id || fallbackId || randomUUID()),
    type,
    url,
    ...(type === "video"
      ? {
          mime: mime === "video/webm" ? "video/webm" : "video/mp4",
          duration: Number.isFinite(duration) && duration > 0 ? Math.round(duration * 100) / 100 : null,
        }
      : {}),
    button: normalizeButton(value.button),
  };
}

function validateSlot(slot) {
  if (slot !== "desktop" && slot !== "mobile") {
    throw new Error("Invalid banner slot.");
  }
  return slot;
}

function legacySlides(slot, banner) {
  const urls = slot === "mobile" ? banner.mobile_image_urls : banner.desktop_image_urls;
  const singleUrl = slot === "mobile" ? banner.mobile_image_url : banner.desktop_image_url;
  const uniqueUrls = [...new Set([...safeJsonArray(urls), singleUrl].filter(Boolean))];

  return uniqueUrls
    .map((url, index) => normalizeSlide({
      id: `legacy-${slot}-${index}`,
      type: "image",
      url,
    }, `legacy-${slot}-${index}`))
    .filter(Boolean);
}

function storedSlides(value, slot) {
  return safeJsonArray(value)
    .map((slide, index) => normalizeSlide(slide, `${slot}-${index}`))
    .filter(Boolean);
}

function slotSlides(banner, slot) {
  const stored = storedSlides(slot === "mobile" ? banner.mobile_slides : banner.desktop_slides, slot);
  return stored.length > 0 ? stored : legacySlides(slot, banner);
}

function imageUrls(slides) {
  return slides.filter((slide) => slide.type === "image").map((slide) => slide.url);
}

async function ensureColumn(column) {
  try {
    await query(`ALTER TABLE site_banner ADD COLUMN ${column} TEXT NULL`);
  } catch (error) {
    if (!/duplicate column/i.test(error.message || "")) throw error;
  }
}

async function ensureBannerRow() {
  await query(
    `CREATE TABLE IF NOT EXISTS site_banner (
      id INT PRIMARY KEY,
      desktop_image_url TEXT NULL,
      mobile_image_url TEXT NULL,
      desktop_image_urls TEXT NULL,
      mobile_image_urls TEXT NULL,
      desktop_slides TEXT NULL,
      mobile_slides TEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );

  const columns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'site_banner'"
  );
  const existing = new Set(columns.map((row) => String(row.COLUMN_NAME || row.column_name).toLowerCase()));
  for (const column of [
    "desktop_image_url",
    "mobile_image_url",
    "desktop_image_urls",
    "mobile_image_urls",
    "desktop_slides",
    "mobile_slides",
  ]) {
    if (!existing.has(column)) await ensureColumn(column);
  }

  await query(
    "INSERT INTO site_banner (id, desktop_image_url, mobile_image_url) VALUES (1, NULL, NULL) ON DUPLICATE KEY UPDATE id = id"
  );
}

export async function getBanner() {
  await ensureBannerRow();
  const rows = await query("SELECT * FROM site_banner WHERE id = 1 LIMIT 1");
  const banner = rows[0] ?? {};
  const desktopSlides = slotSlides(banner, "desktop");
  const mobileSlides = slotSlides(banner, "mobile");
  const desktopImages = imageUrls(desktopSlides);
  const mobileImages = imageUrls(mobileSlides);

  return {
    ...banner,
    desktop_image_url: desktopImages[0] ?? null,
    mobile_image_url: mobileImages[0] ?? null,
    desktop_image_urls: desktopImages,
    mobile_image_urls: mobileImages,
    desktop_slides: desktopSlides,
    mobile_slides: mobileSlides,
  };
}

async function saveSlotSlides(slot, slides) {
  validateSlot(slot);
  const normalizedSlides = slides.map((slide, index) => normalizeSlide(slide, `${slot}-${index}`)).filter(Boolean);
  const slidesJson = normalizedSlides.length > 0 ? JSON.stringify(normalizedSlides) : null;
  const urls = imageUrls(normalizedSlides);
  const urlsJson = urls.length > 0 ? JSON.stringify(urls) : null;
  const firstUrl = urls[0] ?? null;

  if (slot === "mobile") {
    await query(
      "UPDATE site_banner SET mobile_image_url = ?, mobile_image_urls = ?, mobile_slides = ? WHERE id = 1",
      [firstUrl, urlsJson, slidesJson]
    );
  } else {
    await query(
      "UPDATE site_banner SET desktop_image_url = ?, desktop_image_urls = ?, desktop_slides = ? WHERE id = 1",
      [firstUrl, urlsJson, slidesJson]
    );
  }
}

export async function addBannerSlide(slot, slide) {
  validateSlot(slot);
  await ensureBannerRow();
  const banner = await getBanner();
  const slides = slotSlides(banner, slot);
  const normalized = normalizeSlide({ ...slide, id: slide.id || randomUUID() }, randomUUID());
  if (!normalized) throw new Error("The banner media is invalid.");
  await saveSlotSlides(slot, [...slides.filter((item) => item.id !== normalized.id), normalized]);
  return normalized;
}

export async function updateBannerSlide(slot, id, changes = {}) {
  validateSlot(slot);
  await ensureBannerRow();
  const banner = await getBanner();
  const slides = slotSlides(banner, slot);
  const existing = slides.find((slide) => slide.id === id);
  if (!existing) throw new Error("Banner slide not found.");

  const updated = normalizeSlide({ ...existing, ...changes, id: existing.id }, existing.id);
  if (!updated) throw new Error("The banner slide is invalid.");
  await saveSlotSlides(slot, slides.map((slide) => (slide.id === id ? updated : slide)));
  return updated;
}

export async function removeBannerSlide(slot, id) {
  validateSlot(slot);
  await ensureBannerRow();
  const banner = await getBanner();
  const slides = slotSlides(banner, slot);
  await saveSlotSlides(slot, slides.filter((slide) => slide.id !== id));
}

// Kept for callers that only know about the legacy image API.
export async function addBannerImage(slot, url) {
  return addBannerSlide(slot, { type: "image", url });
}

export async function resetBanner() {
  await ensureBannerRow();
  await query(
    `UPDATE site_banner SET
      desktop_image_url = NULL,
      mobile_image_url = NULL,
      desktop_image_urls = NULL,
      mobile_image_urls = NULL,
      desktop_slides = NULL,
      mobile_slides = NULL
     WHERE id = 1`
  );
}
