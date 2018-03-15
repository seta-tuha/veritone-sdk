import React from 'react';
import { func, arrayOf, string, objectOf, any } from 'prop-types';
import withMuiThemeProvider from '../../helpers/withMuiThemeProvider';

import styles from './styles/container.scss';
import SectionTree, { sectionsShape } from './SectionTree';

export { sectionsShape } from './SectionTree';

@withMuiThemeProvider
export default class NavigationSideBarContainer extends React.Component {
  static propTypes = {
    sections: sectionsShape.isRequired,
    classes: objectOf(any),
    selectedItemClasses: objectOf(any),
    // provided by wrapper:
    activePath: arrayOf(string).isRequired,
    onNavigate: func.isRequired
  };
  static defaultProps = {
    selectedFilters: []
  };

  render() {
    return (
      <div className={styles.container}>
        <div style={{ width: '100%' }}>
          <SectionTree
            sections={this.props.sections}
            activePath={this.props.activePath}
            onNavigate={this.props.onNavigate}
            classes={this.props.classes}
            selectedItemClasses={this.props.selectedItemClasses}
          />
        </div>
      </div>
    );
  }
}
