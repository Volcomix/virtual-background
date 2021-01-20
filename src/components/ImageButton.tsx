import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import clsx from 'clsx'

type ImageButtonProps = {
  imageUrl: string
  isActive: boolean
  onClick: () => void
}

function ImageButton(props: ImageButtonProps) {
  const classes = useStyles()

  return (
    <Button
      key={props.imageUrl}
      className={clsx(classes.root, props.isActive && classes.active)}
      onClick={props.onClick}
    >
      <img className={classes.image} src={props.imageUrl} alt="" />
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
        transform: 'scale(1.12)',
      },
    },
    active: {
      borderColor: theme.palette.primary.main,
      transform: 'scale(1.12)',
    },
    image: {
      width: 'calc(100% + 2px)',
      height: 'calc(100% + 2px)',
      margin: -1,
      borderRadius: 4,
      objectFit: 'cover',
    },
  })
)

export default ImageButton
