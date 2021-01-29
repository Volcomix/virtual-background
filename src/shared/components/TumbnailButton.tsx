import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Skeleton from '@material-ui/lab/Skeleton'
import clsx from 'clsx'
import SelectionButton from './SelectionButton'

type ThumbnailButtonProps = {
  thumbnailUrl?: string
  active: boolean
  children?: React.ReactNode
  onClick: () => void
  onLoad?: () => void
}

function ThumbnailButton(props: ThumbnailButtonProps) {
  const classes = useStyles()

  return (
    <SelectionButton
      active={!!props.thumbnailUrl && props.active}
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
    </SelectionButton>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    scalableContent: {
      // Fixes rendering issues with border when scaled
      width: 'calc(100% + 2px)',
      height: 'calc(100% + 2px)',
      margin: -1,
      borderRadius: theme.shape.borderRadius,
    },
    image: {
      objectFit: 'cover',
    },
  })
)

export default ThumbnailButton
