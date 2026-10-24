"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Smartphone, Upload, RotateCcw, Save, Trash2, Play } from "lucide-react";
import Button from "../ui/Button";
import {
  removeBannerSlideAction,
  resetBannerAction,
  updateBannerSlideAction,
  uploadBannerMediaAction,
} from "@/app/actions/banner";
import { BANNER_MEDIA_ACCEPT } from "@/lib/mediaLimits";
import { qaImg } from "@/lib/debugImages";

const DEFAULT_BUTTON = { label: "Shop now", href: "/shop", x: 82, y: 80 };

function copyButton(button) {
  return {
    ...DEFAULT_BUTTON,
    ...(button ?? {}),
  };
}

function roundPosition(value) {
  return Math.round(Math.min(95, Math.max(5, value)) * 10) / 10;
}

function SlideThumbnail({ slide, selected, onClick, onRemove, label, aspectClass }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border ${selected ? "border-brand-500" : "border-ink-100"}`}>
      <button type="button" onClick={onClick} className={`block ${aspectClass} w-full bg-ink-100 text-left`}>
        {slide.type === "video" ? (
          <div className="relative h-full w-full">
            <video src={qaImg(slide.url)} muted playsInline preload="metadata" className="h-full w-full object-contain" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
              <Play className="h-5 w-5 fill-current" />
            </span>
          </div>
        ) : (
          <img src={qaImg(slide.url)} alt={`${label} slide`} className="h-full w-full object-contain" />
        )}
      </button>
      <button
        type="button"
        aria-label={`Delete ${label} slide`}
        onClick={onRemove}
        className="absolute top-2 right-2 rounded-full bg-ink-950/75 p-1.5 text-white hover:bg-danger"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <span className="absolute bottom-2 left-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-[10px] font-semibold text-white">
        {slide.type === "video" ? "Video" : "Image"}
      </span>
    </div>
  );
}

function BannerSlot({ label, icon: Icon, currentSlides = [], slot }) {
  const aspectClass = slot === "mobile" ? "aspect-[9/16]" : "aspect-[16/9]";
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const dragTargetRef = useRef(null);
  const [slides, setSlides] = useState(currentSlides);
  const [selectedId, setSelectedId] = useState(currentSlides[0]?.id ?? null);
  const [draftButton, setDraftButton] = useState(copyButton(currentSlides[0]?.button));
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    // This effect intentionally mirrors refreshed server props into the local editor state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlides(currentSlides);
    setSelectedId((id) => (currentSlides.some((slide) => slide.id === id) ? id : currentSlides[0]?.id ?? null));
  }, [currentSlides]);

  const selectedSlide = slides.find((slide) => slide.id === selectedId) ?? null;

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
        const result = await uploadBannerMediaAction(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSlides((items) => [...items, result.slide]);
        setSelectedId(result.slide.id);
        setDraftButton(copyButton(result.slide.button));
        setSuccess("Media uploaded and added to this slideshow.");
        router.refresh();
      } catch (uploadError) {
        setError(uploadError.message || "Could not upload banner media.");
      } finally {
        setUploading(false);
        input.value = "";
      }
    });
  }

  function handlePointerDown(event) {
    if (!selectedSlide || !previewRef.current) return;
    event.preventDefault();
    dragTargetRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event) {
    if (!dragging || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    setDraftButton((button) => ({
      ...button,
      x: roundPosition(((event.clientX - rect.left) / rect.width) * 100),
      y: roundPosition(((event.clientY - rect.top) / rect.height) * 100),
    }));
  }

  function handlePointerUp(event) {
    setDragging(false);
    dragTargetRef.current?.releasePointerCapture?.(event.pointerId);
    dragTargetRef.current = null;
  }

  function handleSave() {
    if (!selectedSlide) return;
    setError("");
    setSuccess("");
    setSaving(true);
    startTransition(async () => {
      try {
        const result = await updateBannerSlideAction(slot, selectedSlide.id, draftButton);
        setSlides((items) => items.map((slide) => (slide.id === selectedSlide.id ? result.slide : slide)));
        setSuccess("Action button saved for this slide.");
        router.refresh();
      } catch (saveError) {
        setError(saveError.message || "Could not save this slide.");
      } finally {
        setSaving(false);
      }
    });
  }

  function handleRemove(slide) {
    if (!window.confirm("Remove this banner slide?")) return;
    setError("");
    setSuccess("");
    setRemoving(true);
    startTransition(async () => {
      try {
        await removeBannerSlideAction(slot, slide.id);
        const remaining = slides.filter((item) => item.id !== slide.id);
        setSlides(remaining);
        if (selectedId === slide.id) {
          setSelectedId(remaining[0]?.id ?? null);
          setDraftButton(copyButton(remaining[0]?.button));
        }
        setSuccess("Slide removed.");
        router.refresh();
      } catch (removeError) {
        setError(removeError.message || "Could not remove this slide.");
      } finally {
        setRemoving(false);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink-100 p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="mt-1 text-xs text-ink-500">
        Use {slot === "mobile" ? "1080×1920 portrait" : "1920×1080 landscape"} artwork. Images up to 5MB. Videos must be MP4/WebM, up to 20MB and 15 seconds.
      </p>

      {slides.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {slides.map((slide) => (
            <SlideThumbnail
              key={slide.id}
              slide={slide}
              label={label}
              selected={slide.id === selectedId}
              onClick={() => {
                setError("");
                setSelectedId(slide.id);
                setDraftButton(copyButton(slide.button));
              }}
              onRemove={() => handleRemove(slide)}
              aspectClass={aspectClass}
            />
          ))}
        </div>
      ) : (
        <div className={`mt-4 flex ${aspectClass} items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50 text-xs text-ink-400`}>
          Using default gradient
        </div>
      )}

      <input ref={inputRef} type="file" accept={BANNER_MEDIA_ACCEPT} onChange={handleFileChange} className="hidden" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        disabled={uploading || removing}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Add Image or Video"}
      </Button>

      {selectedSlide && (
        <div className="mt-5 border-t border-ink-100 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Action button</h3>
              <p className="mt-1 text-xs text-ink-500">Drag the button over the image or video to position it.</p>
            </div>
            <span className="text-xs text-ink-400">{draftButton.x}% / {draftButton.y}%</span>
          </div>

          <div
            ref={previewRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative mt-3 ${aspectClass} touch-none overflow-hidden rounded-xl border border-ink-100 bg-ink-100`}
          >
            {selectedSlide.type === "video" ? (
              <video
                src={qaImg(selectedSlide.url)}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
              />
            ) : (
              <img src={qaImg(selectedSlide.url)} alt={`${label} preview`} className="h-full w-full object-contain" />
            )}
            <button
              type="button"
              onPointerDown={handlePointerDown}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-ink-950/25 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
              style={{ left: `${draftButton.x}%`, top: `${draftButton.y}%`, touchAction: "none" }}
            >
              {draftButton.label || "Action button"}
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-ink-600">
              Button label
              <input
                value={draftButton.label}
                maxLength={40}
                onChange={(event) => setDraftButton((button) => ({ ...button, label: event.target.value }))}
                placeholder="Shop now"
                className="mt-1 h-10 w-full rounded-lg border border-ink-200 px-3 text-sm font-normal text-ink-900 outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-xs font-semibold text-ink-600">
              Button link
              <input
                value={draftButton.href}
                maxLength={2048}
                onChange={(event) => setDraftButton((button) => ({ ...button, href: event.target.value }))}
                placeholder="/shop or https://..."
                className="mt-1 h-10 w-full rounded-lg border border-ink-200 px-3 text-sm font-normal text-ink-900 outline-none focus:border-brand-500"
              />
            </label>
          </div>
          <Button type="button" size="sm" className="mt-3" disabled={saving || removing} onClick={handleSave}>
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save button"}
          </Button>
        </div>
      )}

      <p className="mt-3 text-xs text-ink-400">
        {slides.length} slide{slides.length === 1 ? "" : "s"} active
      </p>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {success && (
        <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </p>
      )}
    </div>
  );
}

export default function AdminBannerManager({ banner }) {
  const [, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);
  const router = useRouter();
  const desktopSlides = banner.desktop_slides ?? (banner.desktop_image_urls ?? []).map((url) => ({ type: "image", url }));
  const mobileSlides = banner.mobile_slides ?? (banner.mobile_image_urls ?? []).map((url) => ({ type: "image", url }));

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Homepage Banner</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Build separate desktop and mobile slideshows. Each slide can be an image or video and can have its own drag-positioned action button.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={resetting} onClick={handleReset}>
          <RotateCcw className="h-4 w-4" /> {resetting ? "Resetting..." : "Reset banner"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <BannerSlot label="Desktop Banner" icon={Monitor} slot="desktop" currentSlides={desktopSlides} />
        <BannerSlot label="Mobile Banner" icon={Smartphone} slot="mobile" currentSlides={mobileSlides} />
      </div>
    </div>
  );
}
