import clsx from 'clsx'
import './VideoControl.css'

type VideoControlProps = {
  children: React.ReactNode
  isActivated?: boolean
  onClick: () => void
}

function VideoControl(props: VideoControlProps) {
  return (
    <button
      className={clsx(
        'VideoControl',
        props.isActivated && 'VideoControl-activated'
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

export default VideoControl
