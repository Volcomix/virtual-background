import ThumbnailButton from './TumbnailButton'

type VideoButtonProps = {
  videoUrl: string
  isActive: boolean
  onClick: () => void
}

function VideoButton(props: VideoButtonProps) {
  return (
    <ThumbnailButton
      thumbnailUrl={null}
      isActive={props.isActive}
      onClick={props.onClick}
    />
  )
}

export default VideoButton
