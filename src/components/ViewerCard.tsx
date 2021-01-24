import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { BodyPix } from '@tensorflow-models/body-pix'
import { useEffect, useState } from 'react'
import { Background } from '../helpers/backgroundHelper'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { SegmentationConfig } from '../helpers/segmentationHelper'
import { Source, SourcePlayback } from '../helpers/sourceHelper'
import OutputViewer from './OutputViewer'
import SourceViewer from './SourceViewer'

type ViewerCardProps = {
  source: Source
  background: Background
  bodyPix?: BodyPix
  segmentationConfig: SegmentationConfig
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
      <SourceViewer source={props.source} onLoad={setSourcePlayback} />
      {sourcePlayback && props.bodyPix ? (
        <OutputViewer
          sourcePlayback={sourcePlayback}
          background={props.background}
          bodyPix={props.bodyPix}
          segmentationConfig={props.segmentationConfig}
          postProcessingConfig={props.postProcessingConfig}
        />
      ) : (
        <div className={classes.noOutput}>
          <Avatar className={classes.avatar} />
        </div>
      )}
    </Paper>
  )
}

const useStyles = makeStyles((theme: Theme) => {
  const minHeight = [`${theme.spacing(52)}px`, `100vh - ${theme.spacing(2)}px`]

  return createStyles({
    root: {
      minHeight: `calc(min(${minHeight.join(', ')}))`,
      display: 'flex',
      overflow: 'hidden',

      [theme.breakpoints.up('md')]: {
        gridColumnStart: 1,
        gridColumnEnd: 3,
      },

      [theme.breakpoints.up('lg')]: {
        gridRowStart: 1,
        gridRowEnd: 3,
      },
    },
    noOutput: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: theme.spacing(20),
      height: theme.spacing(20),
    },
  })
})

export default ViewerCard
