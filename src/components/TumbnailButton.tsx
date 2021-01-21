import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Skeleton from '@material-ui/lab/Skeleton'
import clsx from 'clsx'

type ThumbnailButtonProps = {
  thumbnailUrl: string | null
  isActive: boolean
  onClick: () => void
}

function ThumbnailButton(props: ThumbnailButtonProps) {
  const classes = useStyles()

  return (
    <Button
      key={props.thumbnailUrl}
      className={clsx(classes.root, props.isActive && classes.active)}
      disabled={!props.thumbnailUrl}
      onClick={props.onClick}
    >
      {props.thumbnailUrl ? (
        <img
          className={clsx(classes.scalableContent, classes.image)}
          src={props.thumbnailUrl}
          alt=""
        />
      ) : (
        <Skeleton className={classes.scalableContent} variant="rect" />
      )}
    </Button>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
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
        transform: 'scale(1.125)',
      },
    },
    active: {
      borderColor: theme.palette.primary.main,
      transform: 'scale(1.125)',
    },
    scalableContent: {
      // Fix rendering issues with border when scaled
      width: 'calc(100% + 2px)',
      height: 'calc(100% + 2px)',
      margin: -1,
      borderRadius: 4,
    },
    image: {
      objectFit: 'cover',
    },
  })
)

export default ThumbnailButton
