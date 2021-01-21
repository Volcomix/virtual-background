import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

type SourceViewerProps = {
  sourceUrl: string
}

function SourceViewer(props: SourceViewerProps) {
  const classes = useStyles()

  if (props.sourceUrl.endsWith('.jpg')) {
    return <img className={classes.root} src={props.sourceUrl} alt="" />
  } else {
    return (
      <video className={classes.root} src={props.sourceUrl} autoPlay loop />
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
