import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import VideocamIcon from '@material-ui/icons/Videocam'
import {
  Source,
  sourceImageUrls,
  sourceVideoUrls,
} from '../helpers/sourceHelper'
import ImageButton from './ImageButton'
import SelectionIconButton from './SelectionIconButton'
import VideoButton from './VideoButton'

type SourceSelectionCardProps = {
  source: Source
  onChange: (source: Source) => void
}

function SourceSelectionCard(props: SourceSelectionCardProps) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Source
        </Typography>
        <SelectionIconButton
          active={props.source.type === 'camera'}
          onClick={() => props.onChange({ type: 'camera' })}
        >
          <VideocamIcon />
        </SelectionIconButton>
        {sourceImageUrls.map((imageUrl) => (
          <ImageButton
            key={imageUrl}
            imageUrl={imageUrl}
            active={imageUrl === props.source.url}
            onClick={() => props.onChange({ type: 'image', url: imageUrl })}
          />
        ))}
        {sourceVideoUrls.map((videoUrl) => (
          <VideoButton
            key={videoUrl}
            videoUrl={videoUrl}
            active={videoUrl === props.source.url}
            onClick={() => props.onChange({ type: 'video', url: videoUrl })}
          />
        ))}
      </CardContent>
    </Card>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex: 1,
    },
  })
)

export default SourceSelectionCard
