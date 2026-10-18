import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

const PHOTO_DIR = "daymark_photos";

async function ensureDir() {
  try {
    await Filesystem.mkdir({
      path: PHOTO_DIR,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    // already exists
  }
}

function compressImage(file: File, maxDim: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const scale = maxDim / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
          "image/jpeg",
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });
}

export async function savePhoto(file: File): Promise<string> {
  await ensureDir();
  const compressed = await compressImage(file, 1200, 0.75);
  const base64Data = await blobToBase64(compressed);
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const path = `${PHOTO_DIR}/${filename}`;

  await Filesystem.writeFile({
    path,
    data: base64Data,
    directory: Directory.Data,
  });

  return path;
}

export async function loadPhoto(path: string): Promise<string> {
  // If it's already a data URI (legacy), return as-is
  if (path.startsWith("data:")) return path;

  try {
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    });
    const data = typeof result.data === "string" ? result.data : "";
    return `data:image/jpeg;base64,${data}`;
  } catch {
    return "";
  }
}

export async function deletePhoto(path: string): Promise<void> {
  if (path.startsWith("data:")) return;
  try {
    await Filesystem.deleteFile({
      path,
      directory: Directory.Data,
    });
  } catch {
    // file may not exist
  }
}
