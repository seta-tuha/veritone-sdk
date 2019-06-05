import React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import LeftNavigationPanel from './';

storiesOf('LeftNavigationPanel', module)
  .add('Full path list', () => {
    return (
      <LeftNavigationPanel
        availablePickerTypes={['folder', 'stream', 'upload']}
        currentPickerType={text('currentPickerType', 'folder')}
        toggleContentView={action('toggleContentView')}
      />
    );
  })
