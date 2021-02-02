import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import VideocamIcon from '@material-ui/icons/Videocam'
import ImageButton from '../../shared/components/ImageButton'
import SelectionIconButton from '../../shared/components/SelectionIconButton'
import VideoButton from '../../shared/components/VideoButton'
import {
  SourceConfig,
  sourceImageUrls,
  sourceVideoUrls,
} from '../helpers/sourceHelper'

type SourceConfigCardProps = {
  config: SourceConfig
  onChange: (config: SourceConfig) => void
}

function SourceConfigCard(props: SourceConfigCardProps) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Source
        </Typography>
        <SelectionIconButton
          active={props.config.type === 'camera'}
          onClick={() => props.onChange({ type: 'camera' })}
        >
          <VideocamIcon />
        </SelectionIconButton>
        {sourceImageUrls.map((imageUrl) => (
          <ImageButton
            key={imageUrl}
            imageUrl={imageUrl}
            active={imageUrl === props.config.url}
            onClick={() => props.onChange({ type: 'image', url: imageUrl })}
          />
        ))}
        {sourceVideoUrls.map((videoUrl) => (
          <VideoButton
            key={videoUrl}
            videoUrl={videoUrl}
            active={videoUrl === props.config.url}
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

export default SourceConfigCard
