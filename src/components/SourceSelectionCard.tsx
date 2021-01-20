import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { imageUrls } from '../helpers/sourceHelper'

// TODO Handle cameras and videos
type SourceSelectionCardProps = {
  sourceUrl: string
  onSourceUrlChange: (sourceUrl: string) => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
    },
    sourceButton: {
      padding: 0,
      minWidth: 60,
      height: 60,
      width: 60,
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
      border: '2px solid transparent',
      alignItems: 'stretch',
      transitionProperty: 'transform, border-color',
      transitionDuration: `${theme.transitions.duration.shortest}ms`,
      transitionTimingFunction: theme.transitions.easing.easeInOut,

      '&:hover': {
        transform: 'scale(1.12)',
      },
    },
    sourceButtonActive: {
      borderColor: theme.palette.primary.main,
      transform: 'scale(1.12)',
    },
    sourceImage: {
      width: 'calc(100% + 2px)',
      height: 'calc(100% + 2px)',
      margin: -1,
      borderRadius: 4,
      objectFit: 'cover',
    },
  })
)

function SourceSelectionCard(props: SourceSelectionCardProps) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Source
        </Typography>
        {imageUrls.map((imageUrl) => (
          <Button
            key={imageUrl}
            className={`${classes.sourceButton} ${
              imageUrl === props.sourceUrl ? classes.sourceButtonActive : ''
            }`}
            onClick={() => props.onSourceUrlChange(imageUrl)}
          >
            <img className={classes.sourceImage} src={imageUrl} alt="" />
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

export default SourceSelectionCard
