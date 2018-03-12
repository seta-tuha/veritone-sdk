import React from 'react';
import { V3SearchBar } from 'veritone-react-common';

import widget from '../../shared/widget';

class SearchBar extends React.Component {
  render() {
    return <V3SearchBar {...this.props} />;
  }
}

export default widget(SearchBar);
