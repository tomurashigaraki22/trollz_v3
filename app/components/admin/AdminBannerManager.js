"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, RotateCcw, Monitor, Smartphone } from "lucide-react";
import Button from "../ui/Button";
import { uploadBannerImageAction, resetBannerAction } from "@/app/actions/banner";

function BannerSlot({ label, icon: Icon, currentUrl, slot, onUploaded }) {
  const inputRef = useRef(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const router = useRouter();

  useEffect(() => {
    setPreviewUrl(currentUrl);
  }, [currentUrl]);

  function handleFileChange(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setError("");
    setSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.set("slot", slot);
    formData.set("file", file);

    startTransition(async () => {
      try {
        const result = await uploadBannerImageAction(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setPreviewUrl(result.url);
        setSuccess("Uploaded to Cloudinary and saved.");
        onUploaded?.();
        router.refresh();
      } catch (err) {
        setError(err.message || "Could not upload banner image.");
      } finally {
        setUploading(false);
        input.value = "";
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink-100 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Icon className="h-4 w-4" /> {label}
      </div>

      <div className="mt-3 aspect-[16/7] overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${label} banner preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-400">
            Using default gradient
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Image"}
      </Button>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {success && (
        <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <p className="font-semibold">{success}</p>
          {previewUrl && <p className="mt-1 break-all text-emerald-600">{previewUrl}</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminBannerManager({ banner }) {
  const [, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);
  const router = useRouter();

  function handleReset() {
    if (!window.confirm("Reset the homepage banner back to the default gradient?")) return;
    setResetting(true);
    startTransition(async () => {
      await resetBannerAction();
      setResetting(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Homepage Banner</h1>
          <p className="mt-1 text-sm text-ink-500">
            Upload separate images for desktop and mobile, or leave a slot empty to fall back to
            the default gradient.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={resetting} onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> Reset to Default Gradient
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <BannerSlot
          label="Desktop Banner"
          icon={Monitor}
          slot="desktop"
          currentUrl={banner.desktop_image_url}
        />
        <BannerSlot
          label="Mobile Banner"
          icon={Smartphone}
          slot="mobile"
          currentUrl={banner.mobile_image_url}
        />
      </div>
    </div>
  );
}
