import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const imageUrls = [
  'girl-919048_1280',
  'doctor-5871743_640',
  'woman-5883428_1280',
].map((imageName) => `${process.env.PUBLIC_URL}/images/${imageName}.jpg`)

// TODO Handle cameras and videos
// const videoUrls = ['1615284309', '1814594990', '1992432523'].map(
//   (videoName) => `${process.env.PUBLIC_URL}/videos/${videoName}.mp4`
// )

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
      transition: `transform ${theme.transitions.duration.short}ms ${theme.transitions.easing.easeInOut}`,

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

function SourceSelectionCard() {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          Source
        </Typography>
        {imageUrls.map((imageUrl, i) => (
          <Button
            key={imageUrl}
            className={`${classes.sourceButton} ${
              i === 0 ? classes.sourceButtonActive : ''
            }`}
          >
            <img className={classes.sourceImage} src={imageUrl} alt="" />
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

export default SourceSelectionCard
