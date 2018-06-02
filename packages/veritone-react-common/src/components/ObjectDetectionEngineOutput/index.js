import React, { Component } from 'react';
import { arrayOf, shape, number, string, func, node } from 'prop-types';
import classNames from 'classnames';

import EngineOutputHeader from '../EngineOutputHeader';
import ObjectGroup from './ObjectGroup';

import styles from './styles.scss';

class ObjectDetectionEngineOutput extends Component {
  static propTypes = {
    data: arrayOf(
      shape({
        series: arrayOf(
          shape({
            startTimeMs: number.isRequired,
            stopTimeMs: number.isRequired,
            object: shape({
              label: string.isRequired,
              confidence: number
            }).isRequired
          })
        ).isRequired
      })
    ),
    onObjectOccurrenceClick: func,
    selectedEngineId: string,
    engines: arrayOf(
      shape({
        id: string,
        name: string
      })
    ),
    onEngineChange: func,
    className: string,
    currentMediaPlayerTime: number,
    onExpandClick: func,
    outputNullState: node
  };

  static defaultProps = {
    data: [],
    engines: []
  };

  handleObjectClick = (startTime, stopTime) => {
    this.props.onObjectOccurrenceClick(startTime, stopTime);
  };

  render() {
    const {
      data,
      className,
      selectedEngineId,
      engines,
      onEngineChange,
      currentMediaPlayerTime,
      onExpandClick,
      outputNullState
    } = this.props;

    return (
      <div className={classNames(styles.objectDetectionOutputView, className)}>
        <EngineOutputHeader
          title="Object Detection"
          onExpandClick={onExpandClick}
          onEngineChange={onEngineChange}
          selectedEngineId={selectedEngineId}
          engines={engines}
        />
        {outputNullState || (
          <div className={styles.objectDetectionContent}>
            {data.map(objectGroup => {
              return (
                <ObjectGroup
                  key={`object-group-${objectGroup.sourceEngineId}-${
                    objectGroup.taskId
                  }-${objectGroup.startTimeMs}-${objectGroup.stopTimeMs}`}
                  objectGroup={objectGroup}
                  currentMediaPlayerTime={currentMediaPlayerTime}
                  onObjectClick={this.handleObjectClick}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default ObjectDetectionEngineOutput;
