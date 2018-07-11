import React from 'react';
import { storiesOf } from '@storybook/react';
import { select } from '@storybook/addon-knobs';
import faker from 'faker';
import 'video-react/dist/video-react.css';

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

const timeSeries = [
  {
    startTimeMs: 0,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 5000
  },
  {
    startTimeMs: 2000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 8000
  },
  {
    startTimeMs: 8000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 12000
  },
  {
    startTimeMs: 9000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 14000
  },
  {
    startTimeMs: 10000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 14000
  },
  {
    startTimeMs: 17000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 19000
  },
  {
    startTimeMs: 20000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 25000
  },
  {
    startTimeMs: 21000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 24000
  },
  {
    startTimeMs: 21000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 25000
  },
  {
    startTimeMs: 25000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 30000
  },
  {
    startTimeMs: 28000,
    object: {
      boundingPoly: randomPolyBox()
    },
    stopTimeMs: 30000
  }
];

import BaseStory from '../../shared/BaseStory';
import { MediaPlayer } from './';
import DefaultControlBar from './DefaultControlBar';

const multipleStreams = [
  {
    protocol: 'dash',
    uri:
      'http://yt-dash-mse-test.commondatastorage.googleapis.com/media/car-20120827-manifest.mpd'
  },
  {
    protocol: 'hls',
    uri:
      'http://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8'
  }
];
const hlsStream = [
  {
    protocol: 'hls',
    uri:
      'http://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8'
  }
];
const dashStream = [
  {
    protocol: 'dash',
    uri:
      'http://yt-dash-mse-test.commondatastorage.googleapis.com/media/car-20120827-manifest.mpd'
  }
];
const demoMp4 = 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4';
const alternateDemoMp4 =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
const demoMp3 = 'https://www.sample-videos.com/audio/mp3/wave.mp3';
const demoPosterImage =
  '//static.veritone.com/veritone-ui/default-nullstate.svg';

class Story extends React.Component {
  /* eslint-disable react/prop-types */
  playerRef = React.createRef();

  render() {
    return (
      <div style={{ width: this.props.width }}>
        <MediaPlayer {...this.props} ref={this.playerRef} />
        <DefaultControlBar playerRef={this.playerRef} />
      </div>
    );
  }
}

storiesOf('MediaPlayer', module)
  .add('MP4 (fluid width)', () => (
    <BaseStory
      componentClass={Story}
      componentProps={{
        muted: true,
        autoPlay: true,
        streams: multipleStreams,
        boundingPolySeries: timeSeries,
        readOnly: true,
        fluid: true
      }}
    />
  ))

  .add('DASH (fixed width, pillarboxed)', () => (
    <BaseStory
      componentClass={Story}
      componentProps={{
        muted: true,
        autoPlay: true,
        streams: dashStream,
        width: 800,
        height: 300,
        fluid: false,
        boundingPolySeries: timeSeries,
        readOnly: true
      }}
    />
  ))

  .add('HLS', () => (
    <BaseStory
      componentClass={Story}
      componentProps={{
        muted: true,
        autoPlay: true,
        streams: hlsStream,
        width: 500,
        fluid: false
      }}
    />
  ))

  .add('Multiple Streams', () => (
    <BaseStory
      componentClass={Story}
      componentProps={{
        muted: true,
        autoPlay: true,
        streams: multipleStreams,
        width: 500,
        fluid: false
      }}
    />
  ))

  .add('Switch Source', () => {
    const label = 'Video Sources';
    const options = [demoMp4, alternateDemoMp4];
    const value = select(label, options, options[0]);

    return (
      <BaseStory
        componentClass={Story}
        componentProps={{
          muted: true,
          src: value,
          width: 500,
          fluid: false
        }}
      />
    );
  })

  .add('Audio only', () => (
    <BaseStory
      componentClass={Story}
      componentProps={{
        muted: true,
        src: demoMp3,
        width: 500,
        fluid: false,
        poster: demoPosterImage
      }}
    />
  ));
