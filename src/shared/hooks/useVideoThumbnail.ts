import { useEffect, useState } from 'react'
import { getThumbnailBlob } from '../helpers/thumbnailHelper'

/**
 * Returns a video thumbnail URL and a function to revoke it.
 */
function useVideoThumbnail(videoUrl: string): [string | undefined, () => void] {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>()

  useEffect(() => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.onloadedmetadata = () => {
      video.currentTime = video.duration / 2
    }
    video.onseeked = async () => {
      const blob = await getThumbnailBlob(
        video,
        video.videoWidth,
        video.videoHeight
      )
      if (blob) {
        setThumbnailUrl(URL.createObjectURL(blob))
      }
    }
  }, [videoUrl])

  return [thumbnailUrl, () => URL.revokeObjectURL(thumbnailUrl!)]
}

export default useVideoThumbnail
