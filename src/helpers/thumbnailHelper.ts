/**
 * Returns a thumbnail as a Blob.
 * @param source The source image or video.
 * @param originalWidth The original width of the source before sizing.
 * @param originalHeight The original height of the source before sizing.
 */
export function getThumbnailBlob(
  source: HTMLImageElement | HTMLVideoElement,
  originalWidth: number,
  originalHeight: number
) {
  const sourceSize = Math.min(originalWidth, originalHeight)
  const horizontalShift = (originalWidth - sourceSize) / 2
  const verticalShift = (originalHeight - sourceSize) / 2

  const canvas = document.createElement('canvas')
  canvas.width = 63
  canvas.height = 63
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    source,
    horizontalShift,
    verticalShift,
    sourceSize,
    sourceSize,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob((blob) => resolve(blob))
  )
}
