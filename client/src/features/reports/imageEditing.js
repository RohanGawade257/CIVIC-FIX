const DEFAULT_EDIT_STATE = Object.freeze({
  cropX: 0,
  cropY: 0,
  cropSize: 80,
  zoom: 1,
  rotation: 0,
  quality: 0.82,
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeImageEdit(input = {}) {
  return {
    cropX: clamp(Number(input.cropX ?? DEFAULT_EDIT_STATE.cropX), 0, 100),
    cropY: clamp(Number(input.cropY ?? DEFAULT_EDIT_STATE.cropY), 0, 100),
    cropSize: clamp(Number(input.cropSize ?? DEFAULT_EDIT_STATE.cropSize), 20, 100),
    zoom: clamp(Number(input.zoom ?? DEFAULT_EDIT_STATE.zoom), 1, 3),
    rotation: clamp(Number(input.rotation ?? DEFAULT_EDIT_STATE.rotation), -180, 180),
    quality: clamp(Number(input.quality ?? DEFAULT_EDIT_STATE.quality), 0.6, 0.92),
  };
}

export function calculateCropRect(imageWidth, imageHeight, editInput = {}) {
  const edit = normalizeImageEdit(editInput);
  const baseSize = Math.min(imageWidth, imageHeight) * (edit.cropSize / 100);
  const cropWidth = baseSize / edit.zoom;
  const cropHeight = baseSize / edit.zoom;
  const maxX = Math.max(imageWidth - cropWidth, 0);
  const maxY = Math.max(imageHeight - cropHeight, 0);

  return {
    x: Math.round(maxX * (edit.cropX / 100)),
    y: Math.round(maxY * (edit.cropY / 100)),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to load selected image."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to compress image."));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

export async function createEditedImageFile(file, editInput = {}) {
  const edit = normalizeImageEdit(editInput);
  const image = await loadImage(file);
  const crop = calculateCropRect(image.naturalWidth, image.naturalHeight, edit);
  const outputSize = Math.min(1600, Math.max(crop.width, crop.height));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = outputSize;
  canvas.height = outputSize;

  context.translate(outputSize / 2, outputSize / 2);
  context.rotate((edit.rotation * Math.PI) / 180);
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    -outputSize / 2,
    -outputSize / 2,
    outputSize,
    outputSize,
  );

  const blob = await canvasToBlob(canvas, edit.quality);

  return new File([blob], "civicfix-report-image.webp", {
    type: "image/webp",
  });
}

export { DEFAULT_EDIT_STATE };
