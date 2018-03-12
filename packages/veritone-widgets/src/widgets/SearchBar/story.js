import React from 'react';
import { bool, string } from 'prop-types';
import { connect } from 'react-redux';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { AppContainer } from 'veritone-react-common';
import { modules } from 'veritone-redux-common';
const { user } = modules;

import VeritoneApp from '../../shared/VeritoneApp';
import OAuthLoginButton from '../OAuthLoginButton';
import SearchBarWidget from './';

class Story extends React.Component {

  componentDidMount() {
    this._searchBar = new SearchBarWidget({
      elId: 'appBar-widget',
      color: '#00ccaa',
    });
  }

  componentWillUnmount() {
    this._searchBar.destroy();
  }
  render() {
    return (
      <div>
        <span id="appBar-widget" />
      </div>
    );
  }
}

const app = VeritoneApp();
storiesOf('SearchBar', module).add('Base', () => {
  return <Story store={app._store} />;
});
