import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Slider from '@material-ui/core/Slider'
import Switch from '@material-ui/core/Switch'
import Typography from '@material-ui/core/Typography'
import React, { ChangeEvent } from 'react'
import { PostProcessingConfig } from '../helpers/postProcessingHelper'
import { Pipeline } from '../helpers/segmentationHelper'

type PostProcessingConfigCardProps = {
  config: PostProcessingConfig
  pipeline: Pipeline
  onChange: (postProcessingConfig: PostProcessingConfig) => void
}

function PostProcessingConfigCard(props: PostProcessingConfigCardProps) {
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

export default PostProcessingConfigCard
