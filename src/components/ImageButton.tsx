import useImageThumbnail from '../hooks/useImageThumbnail'
import ThumbnailButton from './TumbnailButton'

type ImageButtonProps = {
  imageUrl: string
  isActive: boolean
  onClick: () => void
}

function ImageButton(props: ImageButtonProps) {
  const [thumbnailUrl, revokeThumbnailUrl] = useImageThumbnail(props.imageUrl)

  return (
    <ThumbnailButton
      thumbnailUrl={thumbnailUrl}
      isActive={props.isActive}
      onClick={props.onClick}
      onLoad={revokeThumbnailUrl}
    />
  )
}

export default ImageButton
