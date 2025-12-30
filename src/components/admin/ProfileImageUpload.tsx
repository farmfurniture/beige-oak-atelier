"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cloudinaryConfig, CLOUDINARY_UPLOAD_URL } from "@/config/cloudinary";

interface ProfileImageUploadProps {
    currentImageUrl?: string;
    onUpload: (url: string) => void;
    disabled?: boolean;
}

export function ProfileImageUpload({
    currentImageUrl,
    onUpload,
    disabled = false,
}: ProfileImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", cloudinaryConfig.uploadPreset);

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || "Upload failed");
        }

        const data = await response.json();
        return data.secure_url;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onUpload(url);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    };

    const displayUrl = previewUrl || currentImageUrl;

    return (
        <div className="relative">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
            />

            <div
                onClick={handleClick}
                className={`relative cursor-pointer group ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
                <Avatar className="h-24 w-24 border-4 border-primary/20 transition-all group-hover:border-primary/40">
                    {displayUrl ? (
                        <AvatarImage src={displayUrl} alt="Admin" />
                    ) : null}
                    <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                        AD
                    </AvatarFallback>
                </Avatar>

                {/* Upload overlay */}
                <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/50 transition-opacity ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}>
                    {uploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                        <Upload className="h-6 w-6 text-white" />
                    )}
                </div>
            </div>

            <p className="mt-2 text-xs text-muted-foreground text-center">
                Click to upload
            </p>
        </div>
    );
}
