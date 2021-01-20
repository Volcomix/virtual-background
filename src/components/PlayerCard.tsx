import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import SourcePlayer from './SourcePlayer'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      overflow: 'hidden',
    },
  })
)

function PlayerCard() {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid container item xs={6}>
          <SourcePlayer />
        </Grid>
      </Grid>
    </Paper>
  )
}

export default PlayerCard
