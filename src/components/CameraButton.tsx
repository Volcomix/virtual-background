import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import VideocamIcon from '@material-ui/icons/Videocam'
import SelectionButton from './SelectionButton'

type CameraButtonProps = {
  active: boolean
  onClick: () => void
}

function CameraButton(props: CameraButtonProps) {
  const classes = useStyles()

  return (
    <SelectionButton active={props.active} onClick={props.onClick}>
      <div className={classes.root}>
        <VideocamIcon />
      </div>
    </SelectionButton>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.palette.text.primary,
      borderRadius: theme.shape.borderRadius,
      margin: -1,
      boxSizing: 'content-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
)

export default CameraButton
