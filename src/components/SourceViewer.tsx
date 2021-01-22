import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Source, SourcePlayback } from '../helpers/sourceHelper'

type SourceViewerProps = {
  source: Source
  onLoad: (sourcePlayback: SourcePlayback) => void
}

function SourceViewer(props: SourceViewerProps) {
  const classes = useStyles()

  if (props.source.type === 'image') {
    return (
      <img
        className={classes.root}
        src={props.source.url}
        alt=""
        onLoad={(event) => {
          props.onLoad({ htmlElement: event.target as HTMLImageElement })
        }}
      />
    )
  } else {
    return (
      <video
        className={classes.root}
        src={props.source.url}
        autoPlay
        playsInline
        controls={false}
        muted
        loop
        onLoadedData={(event) => {
          props.onLoad({ htmlElement: event.target as HTMLVideoElement })
        }}
      />
    )
  }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: theme.spacing(52),
      objectFit: 'cover',
    },
  })
)

export default SourceViewer
