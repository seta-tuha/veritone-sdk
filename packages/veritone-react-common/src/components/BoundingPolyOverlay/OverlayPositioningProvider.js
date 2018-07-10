import React from 'react';
import { node, number } from 'prop-types';

export const OverlayPositioningContext = React.createContext({
  top: 0,
  left: 0,
  height: 0,
  width: 0
});
export default class OverlayPositioningProvider extends React.Component {
  static propTypes = {
    contentHeight: number.isRequired,
    contentWidth: number.isRequired,
    children: node
  };
  static defaultProps = {};

  state = {
    overlayPosition: { top: 0, left: 0, height: 0, width: 0 }
  };

  measuredChildRef = null; // eslint-disable-line
  resizeObserver = null; // eslint-disable-line
  pollingInterval = null;

  componentWillUnmount() {
    clearInterval(this.pollingInterval);
    this.resizeObserver && this.resizeObserver.disconnect();
  }

  measureChild = (element = this.measuredChildRef) => {
    // calculate the actual size of the element we're going to lay on top of
    const {
      height: screenHeight,
      width: screenWidth
    } = element.getBoundingClientRect();
    const { contentWidth, contentHeight } = this.props;

    const ratioScreen = screenWidth / screenHeight;
    const ratioContent = contentWidth / contentHeight;

    const [width, height] =
      ratioScreen > ratioContent
        ? [(contentWidth * screenHeight) / contentHeight, screenHeight]
        : [screenWidth, (contentHeight * screenWidth) / contentWidth];

    this.setState({
      // figure out what styles need to be applied to the overlay component so that
      // it aligns with the content (considering letter/pillarboxing)
      overlayPosition: {
        top: (screenHeight - height) / 2,
        left: (screenWidth - width) / 2,
        height,
        width
      }
    });
  };

  setMeasuredChildRef = r => {
    if (!r) {
      return;
    }

    this.measuredChildRef = r;

    if (!window.ResizeObserver) {
      clearInterval(this.pollingInterval);
      // poll for changes in the measured element's size
      this.pollingInterval = setInterval(this.measureChild, 250);
      return;
    }

    // use ResizeObserver if available (Chrome only), to avoid polling
    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.measureChild(entry.target);
    });

    this.resizeObserver.observe(r);
  };

  render() {
    return (
      <OverlayPositioningContext.Provider value={this.state.overlayPosition}>
        <div
          style={{
            // display: 'inline-flex',
            position: 'relative',
            verticalAlign: 'bottom'
          }}
          ref={this.setMeasuredChildRef}
        >
          {this.props.children}
        </div>
      </OverlayPositioningContext.Provider>
    );
  }
}
