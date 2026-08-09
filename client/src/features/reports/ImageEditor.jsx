import { useEffect, useRef, useState } from "react";
import { drawEditedImage, loadImage } from "./imageEditing.js";

export function ImageEditor({ file, editState, onEditChange, onFileChange }) {
  const canvasRef = useRef(null);
  const [loadedImg, setLoadedImg] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isSubscribed = true;

    if (!file) {
      return () => {
        isSubscribed = false;
      };
    }

    loadImage(file)
      .then((img) => {
        if (isSubscribed) {
          setLoadedImg(img);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setLoadedImg(null);
          setLoadError(err.message || "Failed to load image");
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [file]);

  const activeImg = file ? loadedImg : null;

  useEffect(() => {
    if (activeImg && canvasRef.current) {
      drawEditedImage(activeImg, editState, canvasRef.current);
    }
  }, [activeImg, editState]);

  return (
    <fieldset>
      <legend>Issue image & editing</legend>
      <p>
        <label htmlFor="image">Select image</label>
        <input
          accept="image/jpeg,image/png,image/webp"
          id="image"
          name="image"
          onChange={onFileChange}
          type="file"
        />
      </p>

      {file && loadError ? <p role="alert">{loadError}</p> : null}

      {file && activeImg ? (
        <div>
          <div>
            <label htmlFor="image-preview-canvas">Preview</label>
            <canvas
              id="image-preview-canvas"
              ref={canvasRef}
              style={{ border: "1px solid #ccc", maxHeight: "300px", maxWidth: "300px" }}
            />
          </div>

          <p>
            <label htmlFor="cropX">Crop X ({editState.cropX}%)</label>
            <input
              id="cropX"
              max="100"
              min="0"
              name="cropX"
              onChange={onEditChange}
              type="range"
              value={editState.cropX}
            />
          </p>
          <p>
            <label htmlFor="cropY">Crop Y ({editState.cropY}%)</label>
            <input
              id="cropY"
              max="100"
              min="0"
              name="cropY"
              onChange={onEditChange}
              type="range"
              value={editState.cropY}
            />
          </p>
          <p>
            <label htmlFor="cropSize">Crop size ({editState.cropSize}%)</label>
            <input
              id="cropSize"
              max="100"
              min="20"
              name="cropSize"
              onChange={onEditChange}
              type="range"
              value={editState.cropSize}
            />
          </p>
          <p>
            <label htmlFor="zoom">Zoom ({editState.zoom}x)</label>
            <input
              id="zoom"
              max="3"
              min="1"
              name="zoom"
              onChange={onEditChange}
              step="0.1"
              type="range"
              value={editState.zoom}
            />
          </p>
          <p>
            <label htmlFor="rotation">Rotate ({editState.rotation}°)</label>
            <input
              id="rotation"
              max="180"
              min="-180"
              name="rotation"
              onChange={onEditChange}
              step="5"
              type="range"
              value={editState.rotation}
            />
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}
