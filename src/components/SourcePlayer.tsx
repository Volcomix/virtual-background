import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

type SourcePlayerProps = {
  sourceUrl: string
}

function SourcePlayer(props: SourcePlayerProps) {
  const classes = useStyles()

  return <img className={classes.root} src={props.sourceUrl} alt="" />
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
  })
)

export default SourcePlayer
