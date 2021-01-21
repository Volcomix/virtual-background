import { useEffect, useState } from 'react'

/**
 * Returns a video thumbnail URL and a function to revoke it.
 */
function useVideoThumbnail(videoUrl: string): [string | null, () => void] {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.onloadedmetadata = () => {
      video.currentTime = video.duration / 2
    }
    video.onseeked = () => {
      const videoSize = Math.min(video.videoWidth, video.videoHeight)
      const horizontalShift = (video.videoWidth - videoSize) / 2
      const verticalShift = (video.videoHeight - videoSize) / 2

      const canvas = document.createElement('canvas')
      canvas.width = 63
      canvas.height = 63
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        video,
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
  }, [videoUrl])

  return [thumbnailUrl, () => URL.revokeObjectURL(thumbnailUrl!)]
}

export default useVideoThumbnail
