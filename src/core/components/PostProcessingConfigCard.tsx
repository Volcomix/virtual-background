import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Slider from '@material-ui/core/Slider'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import React, { ChangeEvent } from 'react'
import {
  BlendMode,
  PostProcessingConfig,
} from '../helpers/postProcessingHelper'
import { PipelineName } from '../helpers/segmentationHelper'

type PostProcessingConfigCardProps = {
  config: PostProcessingConfig
  pipeline: PipelineName
  onChange: (config: PostProcessingConfig) => void
}

function PostProcessingConfigCard(props: PostProcessingConfigCardProps) {
  const classes = useStyles()

  function handleSmoothSegmentationMaskChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    props.onChange({
      ...props.config,
      smoothSegmentationMask: event.target.checked,
    })
  }

  function handleSigmaSpaceChange(_event: any, value: number | number[]) {
    props.onChange({
      ...props.config,
      jointBilateralFilter: {
        ...props.config.jointBilateralFilter,
        sigmaSpace: value as number,
      },
    })
  }

  function handleSigmaColorChange(_event: any, value: number | number[]) {
    props.onChange({
      ...props.config,
      jointBilateralFilter: {
        ...props.config.jointBilateralFilter,
        sigmaColor: value as number,
      },
    })
  }

  function handleCoverageChange(_event: any, value: number | number[]) {
    props.onChange({
      ...props.config,
      coverage: value as [number, number],
    })
  }

  function handleLightWrappingChange(_event: any, value: number | number[]) {
    props.onChange({
      ...props.config,
      lightWrapping: value as number,
    })
  }

  function handleBlendModeChange(event: ChangeEvent<{ value: unknown }>) {
    props.onChange({
      ...props.config,
      blendMode: event.target.value as BlendMode,
    })
  }

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          Post-processing
        </Typography>
        {props.pipeline === 'webgl2' ? (
          <React.Fragment>
            <Typography gutterBottom>Joint bilateral filter</Typography>
            <Typography variant="body2">Sigma space</Typography>
            <Slider
              value={props.config.jointBilateralFilter.sigmaSpace}
              min={0}
              max={10}
              step={0.1}
              valueLabelDisplay="auto"
              onChange={handleSigmaSpaceChange}
            />
            <Typography variant="body2">Sigma color</Typography>
            <Slider
              value={props.config.jointBilateralFilter.sigmaColor}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              onChange={handleSigmaColorChange}
            />
            <Typography gutterBottom>Background</Typography>
            <Typography variant="body2">Coverage</Typography>
            <Slider
              value={props.config.coverage}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              onChange={handleCoverageChange}
            />
            <Typography variant="body2" gutterBottom>
              Light wrapping
            </Typography>
            <div className={classes.lightWrapping}>
              <FormControl className={classes.formControl} variant="outlined">
                <InputLabel>Blend mode</InputLabel>
                <Select
                  label="Blend mode"
                  value={props.config.blendMode}
                  onChange={handleBlendModeChange}
                >
                  <MenuItem value="screen">Screen</MenuItem>
                  <MenuItem value="linearDodge">Linear dodge</MenuItem>
                </Select>
              </FormControl>
              <Slider
                value={props.config.lightWrapping}
                min={0}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                onChange={handleLightWrappingChange}
              />
            </div>
          </React.Fragment>
        ) : (
          <FormControlLabel
            label="Smooth segmentation mask"
            control={
              <Switch
                color="primary"
                checked={props.config.smoothSegmentationMask}
                onChange={handleSmoothSegmentationMaskChange}
              />
            }
          />
        )}
      </CardContent>
    </Card>
  )
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    lightWrapping: {
      display: 'flex',
      alignItems: 'center',
    },
    formControl: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(2),
      minWidth: 160,
    },
  })
)

export default PostProcessingConfigCard
