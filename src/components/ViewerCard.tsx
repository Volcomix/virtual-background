import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import SourceViewer from './SourceViewer'

type ViewerCardProps = {
  sourceUrl: string
}

function ViewerCard(props: ViewerCardProps) {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid container item xs={6}>
          <SourceViewer sourceUrl={props.sourceUrl} />
        </Grid>
      </Grid>
    </Paper>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      overflow: 'hidden',
    },
  })
)

export default ViewerCard
