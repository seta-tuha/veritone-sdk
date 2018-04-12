import React, { Component } from 'react';
import { bool } from 'prop-types';

import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs/react';
import { action } from '@storybook/addon-actions';

import styles from './story.styles.scss';
import LogoDetectionEngineOutput from './';

storiesOf('LogoDetectionEngineOutput', module)
  .add('Without Lazy Loading', () => {
    return <LogoDetectionExample />;
  })
  .add('With Lazy Loading', () => {
    return <LogoDetectionExample lazyLoading />;
  });

export class LogoDetectionExample extends Component {
  static propTypes = {
    lazyLoading: bool
  };

  constructor(props) {
    super(props);

    this.state = {
      mockData: genMockData(60, 0, 240000),
      engines: [
        { id: '1', name: 'Engine-X' },
        { id: '2', name: 'Engine-Y' },
        { id: '3', name: 'Engine-Z' }
      ],
      selectedEngineId: '1'
    };
  }

  handleLazyLoading = loadInfo => {
    let newContent = genMockData(60, loadInfo.start, loadInfo.stop);
    this.setState({
      mockData: this.state.mockData.concat(newContent)
    });
  };

  render() {
    let state = this.state;
    return (
      <div className={styles.outputViewRoot}>
        <LogoDetectionEngineOutput
          data={state.mockData}
          mediaPlayerTimeMs={1000 * number('media player time', 0)}
          mediaPlayerTimeIntervalMs={500}
          className={styles.outputViewRoot}
          engines={state.engines}
          selectedEngineId={state.selectedEngineId}
          onScroll={this.props.lazyLoading && this.handleLazyLoading}
          onEntrySelected={action('on select')}
          onEngineChange={action('on engine changed')}
          onExpandClicked={action('on expand clicked')}
          mediaLengthMs={this.props.lazyLoading && 1800000}
          neglectableTimeMs={this.props.lazyLoading && 1000}
          estimatedDisplayTimeMs={this.props.lazyLoading && 240000}
        />
      </div>
    );
  }
}

function genMockData(numEntry = 88, startTimeMs = 0, stopTimeMs = 2000000) {
  let data = [];
  let labelOptions = [
    'ESPN',
    'Veritone',
    'Google',
    'Facebook',
    'Fox',
    'Some very long name 1',
    'Some very very long long long name 2',
    'CNN',
    'Walmart',
    'Toyota Motor',
    'Apple',
    'Exxon Mobil',
    'Some long very long long long long name 3',
    'Some long long name 4',
    'Broadcom',
    'Qualcomm',
    'Xerox',
    'Blizzard',
    'Sony',
    'Samsung',
    'BMW',
    'GMC',
    'Warner Bros.',
    'Walt Disney Studios',
    'Sony Picture',
    'Universal Pictures'
  ];

  let timeInterval = stopTimeMs - startTimeMs;
  let maxOptionIndex = labelOptions.length - 1;
  for (let entryIndex = 0; entryIndex < numEntry; entryIndex++) {
    let labelIndex = Math.round(Math.random() * maxOptionIndex);
    let entryStartTime = startTimeMs + Math.round(Math.random() * timeInterval);
    let displayTime = Math.round(Math.random() * (stopTimeMs - entryStartTime));
    let entry = {
      startTimeMs: entryStartTime,
      stopTimeMs: entryStartTime + displayTime,
      object: {
        label: labelOptions[labelIndex],
        confidence: Math.random()
      }
    };

    data.push(entry);
  }

  return [
    {
      startTimeMs: startTimeMs,
      stopTimeMs: stopTimeMs,
      series: data
    }
  ];
}
