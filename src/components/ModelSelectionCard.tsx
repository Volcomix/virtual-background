import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Typography from '@material-ui/core/Typography'
import { Model } from '../helpers/modelHelper'

type ModelSelectionCardProps = {
  model: Model
  onModelChange: (model: Model) => void
}

function ModelSelectionCard(props: ModelSelectionCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Person segmentation
        </Typography>
        <FormControl>
          <InputLabel>Model</InputLabel>
          <Select
            value={props.model}
            onChange={(event) =>
              props.onModelChange(event.target.value as Model)
            }
          >
            <MenuItem value={'bodyPix'}>BodyPix</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

export default ModelSelectionCard
