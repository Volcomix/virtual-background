import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline'
import ThumbnailButton from './TumbnailButton'

type VideoButtonProps = {
  videoUrl: string
  isActive: boolean
  onClick: () => void
}

function VideoButton(props: VideoButtonProps) {
  const classes = useStyles()

  return (
    <ThumbnailButton
      thumbnailUrl={null}
      isActive={props.isActive}
      onClick={props.onClick}
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
