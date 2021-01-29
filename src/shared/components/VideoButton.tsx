import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import useVideoThumbnail from '../hooks/useVideoThumbnail'
import ThumbnailButton from './TumbnailButton'

type VideoButtonProps = {
  videoUrl: string
  active: boolean
  onClick: () => void
}

function VideoButton(props: VideoButtonProps) {
  const classes = useStyles()
  const [thumbnailUrl, revokeThumbnailUrl] = useVideoThumbnail(props.videoUrl)

  return (
    <ThumbnailButton
      thumbnailUrl={thumbnailUrl}
      active={props.active}
      onClick={props.onClick}
      onLoad={revokeThumbnailUrl}
    >
      <PlayCircleOutlineIcon className={classes.icon} />
    </ThumbnailButton>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      color: theme.palette.common.white,
    },
  })
)

export default VideoButton
