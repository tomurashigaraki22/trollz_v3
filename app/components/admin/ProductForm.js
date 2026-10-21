"use client";

import { useMemo, useState } from "react";
import Button from "../ui/Button";
import { getCategoryFields, resolveFieldOptions } from "@/lib/categoryFields";
import { uploadAdminProductImagesAction, uploadAdminProductVideoAction } from "@/app/actions/admin";
import {
  PRODUCT_VIDEO_ACCEPT,
  PRODUCT_VIDEO_MAX_BYTES,
  PRODUCT_VIDEO_MAX_DURATION_SECONDS,
  formatMegabytes,
} from "@/lib/mediaLimits";

const emptyForm = {
  item: "",
  category: "",
  subcategory: "",
  price: "",
  discount: "0",
  qty: "0",
  description: "",
};

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function readVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Number(video.duration));
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The video could not be read. Use an MP4 or WebM file."));
    };
    video.src = objectUrl;
  });
}

function toFormValues(product) {
  if (!product) return emptyForm;
  return {
    item: product.item ?? "",
    category: product.category ?? "",
    subcategory: product.subcategory ?? "",
    price: String(product.originalPrice ?? product.old_price ?? product.price ?? ""),
    discount: String(product.discount ?? 0),
    qty: String(product.qty ?? 0),
    description: product.description ?? "",
  };
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-800">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ChipToggle({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(active ? value.filter((item) => item !== option) : [...value, option])}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-ink-200 text-ink-700 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function DynamicField({ field, subcategory, value, onChange }) {
  const options = resolveFieldOptions(field, subcategory);

  if (field.type === "multiselect") {
    return (
      <Field label={field.label}>
        <ChipToggle options={options} value={value ?? []} onChange={onChange} />
      </Field>
    );
  }

  if (field.type === "select") {
    return (
      <Field label={field.label}>
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  return (
    <Field label={field.label}>
      <input
        type={field.type === "date" ? "date" : "text"}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
      />
    </Field>
  );
}

export default function ProductForm({ product, categories, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => toFormValues(product));
  const [attributeValues, setAttributeValues] = useState(() => ({
    ...(product?.attributes ?? {}),
    colors: product?.colorOptions ?? parseJsonArray(product?.color_options),
    sizes: product?.sizeOptions ?? parseJsonArray(product?.size_options),
  }));
  const [imageUrls, setImageUrls] = useState(() => parseJsonArray(product?.img ?? product?.images));
  const [video, setVideo] = useState(() => (
    product?.videoUrl || product?.video_url
      ? {
          url: product.videoUrl || product.video_url,
          duration: Number(product.videoDuration || product.video_duration || 0),
          mime: product.videoMime || product.video_mime || "video/mp4",
        }
      : null
  ));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const categoryFields = useMemo(
    () => (form.category ? getCategoryFields(form.category) : []),
    [form.category]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "category") {
      setForm((prev) => ({ ...prev, subcategory: "" }));
    }
  }

  function setAttribute(key, value) {
    setAttributeValues((current) => ({ ...current, [key]: value }));
  }

  async function handleImages(event) {
    const files = Array.from(event.target.files || []).slice(0, 8 - imageUrls.length);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const urls = await uploadAdminProductImagesAction(formData);
      setImageUrls((current) => [...current, ...urls].slice(0, 8));
    } catch (uploadError) {
      setError(uploadError.message || "Could not upload product image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleVideo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      if (!["video/mp4", "video/webm"].includes(file.type)) {
        throw new Error("Use an MP4 or WebM video for reliable web playback.");
      }
      if (file.size > PRODUCT_VIDEO_MAX_BYTES) {
        throw new Error(`Product video must be smaller than ${formatMegabytes(PRODUCT_VIDEO_MAX_BYTES)}.`);
      }
      const duration = await readVideoDuration(file);
      if (!Number.isFinite(duration) || duration <= 0 || duration > PRODUCT_VIDEO_MAX_DURATION_SECONDS) {
        throw new Error(`Product video duration must be between 1 and ${PRODUCT_VIDEO_MAX_DURATION_SECONDS} seconds.`);
      }
      const formData = new FormData();
      formData.set("file", file);
      const media = await uploadAdminProductVideoAction(formData);
      setVideo({
        url: media.url,
        duration: Number(media.duration || duration),
        mime: media.mime || file.type,
      });
    } catch (uploadError) {
      setError(uploadError.message || "Could not upload product video.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const otherAttributes = Object.fromEntries(
      Object.entries(attributeValues).filter(([key]) => key !== "colors" && key !== "sizes")
    );

    onSubmit({
      item: form.item,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price) || 0,
      discount: Number(form.discount) || 0,
      qty: Number(form.qty) || 0,
      description: form.description,
      img: JSON.stringify(imageUrls),
      videoUrl: video?.url || null,
      videoDuration: video?.duration || null,
      videoMime: video?.mime || null,
      sizeOptions: attributeValues.sizes ?? [],
      colorOptions: attributeValues.colors ?? [],
      attributes: otherAttributes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Product Name">
          <input
            name="item"
            required
            value={form.item}
            onChange={handleChange}
            className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </Field>
      </div>

      <Field label="Category">
        <select
          name="category"
          required
          value={form.category}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Subcategory">
        <input
          name="subcategory"
          value={form.subcategory}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      <Field label="Price (NGN)">
        <input
          name="price"
          type="number"
          min="0"
          required
          value={form.price}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      <Field label="Discount (%)">
        <input
          name="discount"
          type="number"
          min="0"
          max="100"
          value={form.discount}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      <Field label="Stock Quantity">
        <input
          name="qty"
          type="number"
          min="0"
          value={form.qty}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      {categoryFields.length > 0 && (
        <div className="sm:col-span-2">
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <h2 className="text-sm font-semibold text-ink-900">Product details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {categoryFields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  subcategory={form.subcategory}
                  value={attributeValues[field.key]}
                  onChange={(value) => setAttribute(field.key, value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label="Product Images (up to 8)">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleImages} disabled={uploading || imageUrls.length >= 8} />
          {uploading && <p className="mt-2 text-sm text-ink-500">Uploading images...</p>}
          {imageUrls.length > 0 && <div className="mt-3 grid grid-cols-4 gap-2">{imageUrls.map((url) => <img key={url} src={url} alt="" className="aspect-square rounded-lg object-cover" />)}</div>}
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label="Product Video (optional)">
          <p className="mb-2 text-xs text-ink-500">
            MP4 or WebM only, maximum {formatMegabytes(PRODUCT_VIDEO_MAX_BYTES)} and {PRODUCT_VIDEO_MAX_DURATION_SECONDS} seconds.
          </p>
          <input type="file" accept={PRODUCT_VIDEO_ACCEPT} onChange={handleVideo} disabled={uploading} />
          {video && (
            <div className="mt-3 overflow-hidden rounded-xl border border-ink-100">
              <video src={video.url} controls playsInline preload="metadata" className="aspect-video w-full bg-black object-contain" />
              <div className="flex items-center justify-between px-3 py-2 text-xs text-ink-500">
                <span>{video.duration ? `${video.duration.toFixed(1)} seconds` : "Uploaded video"}</span>
                <button type="button" onClick={() => setVideo(null)} className="font-semibold text-danger">Remove video</button>
              </div>
            </div>
          )}
        </Field>
      </div>
      {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}

      <div className="sm:col-span-2">
        <Button type="submit">{submitLabel ?? (product ? "Save Changes" : "Add Product")}</Button>
      </div>
    </form>
  );
}
