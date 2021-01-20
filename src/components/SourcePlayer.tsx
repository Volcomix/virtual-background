import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

type SourcePlayerProps = {
  sourceUrl: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
  })
)

function SourcePlayer(props: SourcePlayerProps) {
  const classes = useStyles()

  return <img className={classes.root} src={props.sourceUrl} alt="" />
}

export default SourcePlayer
