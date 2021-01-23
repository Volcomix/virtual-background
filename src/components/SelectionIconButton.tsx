import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import SelectionButton from './SelectionButton'

type SelectionIconButtonProps = {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}

function SelectionIconButton(props: SelectionIconButtonProps) {
  const classes = useStyles()

  return (
    <SelectionButton active={props.active} onClick={props.onClick}>
      <div className={classes.root}>{props.children}</div>
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
      borderColor: 'rgba(0, 0, 0, 0.23)',
      borderRadius: theme.shape.borderRadius,
      margin: -1,
      boxSizing: 'content-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
)

export default SelectionIconButton
