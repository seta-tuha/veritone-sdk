import React from 'react';
import { storiesOf } from '@storybook/react';
import { select, number, text, boolean } from '@storybook/addon-knobs';
import Slider from '@material-ui/lab/Slider';
import faker from 'faker';

import OverlayPositioningProvider from './OverlayPositioningProvider';
import Overlay from './Overlay';

function randomPolyBox() {
  const rand = faker.random.number;
  const options = { min: 0, max: 1, precision: 0.0001 };

  return Array(4)
    .fill()
    .map(() => ({
      x: rand(options),
      y: rand(options)
    }));
}

const frames = Array(10)
  .fill()
  .map(() => [randomPolyBox(), randomPolyBox()]);

class Story extends React.Component {
  /* eslint-disable react/prop-types */

  state = {
    boundingBoxes: frames[0],
    frame: 0
  };

  handleAddBoundingBox = boundingBoxes => {
    this.setState({ boundingBoxes });
  };

  handleChangeFrame = (e, frame) => {
    this.setState({ frame, boundingBoxes: frames[frame] });
  };

  render() {
    return (
      <div>
        <Slider
          value={this.state.frame}
          min={0}
          max={9}
          step={1}
          onChange={this.handleChangeFrame}
        />
        <OverlayPositioningProvider
          contentHeight={this.props.contentHeight}
          contentWidth={this.props.contentWidth}
        >
          <Overlay
            onBoundingBoxChange={this.handleAddBoundingBox}
            overlayBackgroundColor={this.props.overlayBackgroundColor}
            overlayBorderStyle={this.props.overlayBorderStyle}
            overlayBackgroundBlendMode={this.props.overlayBackgroundBlendMode}
            initialBoundingBoxPolys={this.state.boundingBoxes}
            key={this.state.frame}
            readOnly={this.props.readOnly}
          />
          <div
            style={{
              backgroundImage: `url(https://picsum.photos/${
                this.props.contentWidth
              }/${this.props.contentHeight})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              display: 'block',
              backgroundColor: 'lightBlue',
              height:
                this.props.matteType === 'letterbox'
                  ? this.props.contentHeight + this.props.matteSize
                  : this.props.contentHeight,
              width:
                this.props.matteType === 'pillarbox'
                  ? this.props.contentWidth + this.props.matteSize
                  : this.props.contentWidth
            }}
          />
        </OverlayPositioningProvider>
      </div>
    );
  }
}

storiesOf('BoundingPolyOverlay', module).add('Base', () => {
  /* eslint-disable react/jsx-no-bind */
  const options = {
    letterbox: 'Letterbox',
    pillarbox: 'Pillarbox'
  };

  const matteType = select('Matte type', options, 'pillarbox');

  const contentWidth = number('content width', 320);
  const contentHeight = number('content height', 240);
  const matteSize = number('matte size', 100);
  const overlayBackgroundColor = text('Overlay background color', '#FF6464');
  const overlayBorderStyle = text('Overlay border style', '1px solid #fff');
  const overlayBackgroundBlendMode = text(
    'Overlay background blend mode',
    'hard-light'
  );
  const readOnly = boolean('Read only mode', false);

  return (
    <div>
      <p>
        Matte type: {options[matteType]} ({matteSize}px)
      </p>
      <Story
        contentHeight={contentHeight}
        contentWidth={contentWidth}
        matteType={matteType}
        matteSize={matteSize}
        overlayBackgroundColor={overlayBackgroundColor}
        overlayBorderStyle={overlayBorderStyle}
        overlayBackgroundBlendMode={overlayBackgroundBlendMode}
        readOnly={readOnly}
      />
    </div>
  );
});
