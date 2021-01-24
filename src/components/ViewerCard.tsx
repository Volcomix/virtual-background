import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { BodyPix } from '@tensorflow-models/body-pix'
import { useEffect, useState } from 'react'
import { Background } from '../helpers/backgroundHelper'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { Source, SourcePlayback } from '../helpers/sourceHelper'
import OutputViewer from './OutputViewer'
import SourceViewer from './SourceViewer'

type ViewerCardProps = {
  source: Source
  background: Background
  bodyPix?: BodyPix
  postProcessingConfig: PostProcessingConfig
}

function ViewerCard(props: ViewerCardProps) {
  const classes = useStyles()
  const [sourcePlayback, setSourcePlayback] = useState<SourcePlayback>()

  useEffect(() => {
    setSourcePlayback(undefined)
  }, [props.source])

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid className={classes.sourceCell} item xs={6}>
          <SourceViewer source={props.source} onLoad={setSourcePlayback} />
        </Grid>
        <Grid className={classes.outputCell} item xs={6}>
          {sourcePlayback && props.bodyPix ? (
            <OutputViewer
              sourcePlayback={sourcePlayback}
              background={props.background}
              bodyPix={props.bodyPix}
              postProcessingConfig={props.postProcessingConfig}
            />
          ) : (
            <Avatar className={classes.avatar} />
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minHeight: theme.spacing(52),
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
    },
    sourceCell: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightStyle: 'solid',
      borderRightColor: theme.palette.divider,
    },
    outputCell: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: theme.spacing(20),
      height: theme.spacing(20),
    },
  })
)

export default ViewerCard
