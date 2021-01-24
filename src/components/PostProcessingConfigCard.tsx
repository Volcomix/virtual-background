import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'

type PostProcessingConfigCardProps = {
  config: PostProcessingConfig
  onChange: (postProcessingConfig: PostProcessingConfig) => void
}

function PostProcessingConfigCard(props: PostProcessingConfigCardProps) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Post-processing
        </Typography>
        <FormControlLabel
          label="Smooth segmentation mask"
          control={
            <Switch
              color="primary"
              checked={props.config.smoothSegmentationMask}
              onChange={(event) => {
                props.onChange({ smoothSegmentationMask: event.target.checked })
              }}
            />
          }
        />
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

export default PostProcessingConfigCard
