"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, RotateCcw, Monitor, Smartphone } from "lucide-react";
import Button from "../ui/Button";
import { uploadBannerImageAction, resetBannerAction } from "@/app/actions/banner";

function BannerSlot({ label, icon: Icon, currentUrl, slot, onUploaded }) {
  const inputRef = useRef(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.set("slot", slot);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadBannerImageAction(formData);
      setUploading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onUploaded?.();
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-ink-100 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Icon className="h-4 w-4" /> {label}
      </div>

      <div className="mt-3 aspect-[16/7] overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={`${label} banner preview`}
            width={800}
            height={350}
            className="h-full w-full object-cover"
            unoptimized
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
