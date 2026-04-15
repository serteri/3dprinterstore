"use client";

import { UploadDropzone } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

type ImageUploadProps = {
  endpoint?: "productImage";
  multiple?: boolean;
  onUploadComplete?: (url: string) => void;
  onUploadsComplete?: (urls: string[]) => void;
};

export default function ImageUpload({
  endpoint = "productImage",
  multiple = false,
  onUploadComplete,
  onUploadsComplete,
}: ImageUploadProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <UploadDropzone<OurFileRouter, typeof endpoint>
        endpoint={endpoint}
        className="ut-button:bg-cyan-400 ut-button:text-zinc-950 ut-button:hover:bg-cyan-300 ut-button:rounded-xl ut-button:font-semibold ut-button:px-4 ut-button:py-2 ut-button:transition-colors ut-upload-icon:text-zinc-500 ut-label:text-zinc-200 ut-allowed-content:text-zinc-400"
        appearance={{
          container:
            "border-2 border-dashed border-zinc-700 bg-zinc-950/70 hover:border-cyan-400/60 transition-colors rounded-xl",
          label: "text-zinc-200",
          allowedContent: "text-zinc-400",
          button:
            "bg-cyan-400 text-zinc-950 hover:bg-cyan-300 font-semibold transition-colors",
          uploadIcon: "text-zinc-500",
        }}
        content={{
          label: "Drop image here or click to browse",
          allowedContent: "Image only • max 4MB",
          button({ ready }) {
            return ready ? "Upload image" : "Preparing...";
          },
        }}
        onClientUploadComplete={(res) => {
          const urls = (res ?? []).map((file) => file.ufsUrl).filter(Boolean);

          if (urls.length > 0) {
            onUploadComplete?.(urls[0]);
            onUploadsComplete?.(urls);
          }
        }}
        onUploadError={(error: Error) => {
          console.error("UploadThing error:", error.message);
        }}
        config={{ mode: multiple ? "auto" : "manual" }}
      />
    </div>
  );
}
