import { useEffect, useState } from 'react'

/**
 * Returns an image thumbnail URL and a function to revoke it.
 */
function useImageThumbnail(imageUrl: string): [string | null, () => void] {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    const image = new Image()
    image.src = imageUrl
    image.onload = () => {
      const videoSize = Math.min(image.naturalWidth, image.naturalHeight)
      const horizontalShift = (image.naturalWidth - videoSize) / 2
      const verticalShift = (image.naturalHeight - videoSize) / 2

      const canvas = document.createElement('canvas')
      canvas.width = 63
      canvas.height = 63
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        image,
        horizontalShift,
        verticalShift,
        videoSize,
        videoSize,
        0,
        0,
        canvas.width,
        canvas.height
      )

      canvas.toBlob((blob) => {
        setThumbnailUrl(URL.createObjectURL(blob))
      })
    }
  }, [imageUrl])

  return [thumbnailUrl, () => URL.revokeObjectURL(thumbnailUrl!)]
}

export default useImageThumbnail
