import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { Background, backgroundImageUrls } from '../helpers/backgroundHelper'
import ImageButton from './ImageButton'

type BackgroundSelectionCardProps = {
  background: Background
  onBackgroundChange: (background: Background) => void
}

function BackgroundSelectionCard(props: BackgroundSelectionCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Background
        </Typography>
        {backgroundImageUrls.map((imageUrl) => (
          <ImageButton
            key={imageUrl}
            imageUrl={imageUrl}
            active={imageUrl === props.background.url}
            onClick={() =>
              props.onBackgroundChange({ type: 'image', url: imageUrl })
            }
          />
        ))}
      </CardContent>
    </Card>
  )
}

export default BackgroundSelectionCard
