import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {
  SegmentationConfig,
  SegmentationModel,
} from '../helpers/segmentationHelper'

type SegmentationConfigCardProps = {
  config: SegmentationConfig
  onChange: (segmentationConfig: SegmentationConfig) => void
}

function SegmentationConfigCard(props: SegmentationConfigCardProps) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Segmentation
        </Typography>
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel>Model</InputLabel>
          <Select
            label="Model"
            value={props.config.model}
            onChange={(event) => {
              props.onChange({ model: event.target.value as SegmentationModel })
            }}
          >
            <MenuItem value={'bodyPix'}>BodyPix</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
    },
    formControl: {
      marginTop: theme.spacing(1),
      minWidth: 120,
    },
  })
)

export default SegmentationConfigCard
