import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
  })
)

function SourcePlayer() {
  const classes = useStyles()

  return (
    <img
      className={classes.root}
      src={`${process.env.PUBLIC_URL}/images/girl-919048_1280.jpg`}
      alt=""
    />
  )
}

export default SourcePlayer
