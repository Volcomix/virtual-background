import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {
  Source,
  sourceImageUrls,
  sourceVideoUrls,
} from '../helpers/sourceHelper'
import CameraButton from './CameraButton'
import ImageButton from './ImageButton'
import VideoButton from './VideoButton'

type SourceSelectionCardProps = {
  source: Source
  onSourceChange: (source: Source) => void
}

function SourceSelectionCard(props: SourceSelectionCardProps) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Source
        </Typography>
        <CameraButton
          active={props.source.type === 'camera'}
          onClick={() => props.onSourceChange({ type: 'camera' })}
        />
        {sourceImageUrls.map((imageUrl) => (
          <ImageButton
            key={imageUrl}
            imageUrl={imageUrl}
            active={imageUrl === props.source.url}
            onClick={() => {
              props.onSourceChange({ type: 'image', url: imageUrl })
            }}
          />
        ))}
        {sourceVideoUrls.map((videoUrl) => (
          <VideoButton
            key={videoUrl}
            videoUrl={videoUrl}
            active={videoUrl === props.source.url}
            onClick={() => {
              props.onSourceChange({ type: 'video', url: videoUrl })
            }}
          />
        ))}
      </CardContent>
    </Card>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
    },
  })
)

export default SourceSelectionCard
