import './VideoControl.css'

type VideoControlProps = {
  iconName: string
  isActivated?: boolean
  onClick: () => void
}

function VideoControl(props: VideoControlProps) {
  return (
    <button
      className={`VideoControl ${
        props.isActivated ? 'VideoControl-activated' : ''
      }`}
      onClick={props.onClick}
    >
      {props.iconName}
    </button>
  )
}

export default VideoControl
