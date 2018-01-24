import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import FullScreenEditProfileDialog from './';

storiesOf('EditProfileDialog', module).add('default', () => {
  /* eslint-disable react/jsx-no-bind */
  return (
    <FullScreenEditProfileDialog />
  );
});
