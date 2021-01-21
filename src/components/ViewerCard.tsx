import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { useState } from 'react'
import OutputViewer from './OutputViewer'
import SourceViewer from './SourceViewer'

type ViewerCardProps = {
  sourceUrl: string
}

function ViewerCard(props: ViewerCardProps) {
  const classes = useStyles()
  const [source, setSource] = useState<HTMLImageElement | HTMLVideoElement>()

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid className={classes.sourceCell} item xs={6}>
          <SourceViewer sourceUrl={props.sourceUrl} onLoad={setSource} />
        </Grid>
        <Grid className={classes.outputCell} item xs={6}>
          {source ? <OutputViewer source={source} /> : <CircularProgress />}
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
    sourceCell: {
      display: 'flex',
    },
    outputCell: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
)

export default ViewerCard
