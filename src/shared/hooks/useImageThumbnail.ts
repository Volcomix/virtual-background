import { useEffect, useState } from 'react'
import { getThumbnailBlob } from '../helpers/thumbnailHelper'

/**
 * Returns an image thumbnail URL and a function to revoke it.
 */
function useImageThumbnail(imageUrl: string): [string | undefined, () => void] {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>()

  useEffect(() => {
    const image = new Image()
    image.src = imageUrl
    image.onload = async () => {
      const blob = await getThumbnailBlob(
        image,
        image.naturalWidth,
        image.naturalHeight
      )
      if (blob) {
        setThumbnailUrl(URL.createObjectURL(blob))
      }
    }
  }, [imageUrl])

  return [thumbnailUrl, () => URL.revokeObjectURL(thumbnailUrl!)]
}

export default useImageThumbnail
