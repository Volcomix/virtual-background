import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Skeleton from '@material-ui/lab/Skeleton'
import clsx from 'clsx'

type ThumbnailButtonProps = {
  thumbnailUrl: string | null
  isActive: boolean
  children?: React.ReactNode
  onClick: () => void
  onLoad?: () => void
}

function ThumbnailButton(props: ThumbnailButtonProps) {
  const classes = useStyles()

  return (
    <Button
      key={props.thumbnailUrl}
      className={clsx(
        classes.root,
        props.thumbnailUrl && props.isActive && classes.active
      )}
      disabled={!props.thumbnailUrl}
      onClick={props.onClick}
    >
      {props.thumbnailUrl ? (
        <img
          className={clsx(classes.scalableContent, classes.image)}
          src={props.thumbnailUrl}
          alt=""
          onLoad={props.onLoad}
        />
      ) : (
        <Skeleton className={classes.scalableContent} variant="rect" />
      )}
      {props.children}
    </Button>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 0,
      minWidth: theme.spacing(7) + 2,
      height: theme.spacing(7) + 2,
      width: theme.spacing(7) + 2,
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
      border: '2px solid transparent',
      alignItems: 'stretch',
      transitionProperty: 'transform, border-color',
      transitionDuration: `${theme.transitions.duration.shorter}ms`,
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
