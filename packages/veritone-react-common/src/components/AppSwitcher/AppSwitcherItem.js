import React from 'react';
import cx from 'classnames';
import { objectOf, any, func } from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import styles from './styles.scss';

export default class AppSwitcherItem extends React.Component {
  static propTypes = {
    app: objectOf(any).isRequired,
    onSelect: func.isRequired
  };

  handleSwitchApp = () => {
    this.props.onSelect(this.props.app.applicationId);
  };

  render() {
    const { app } = this.props;

    const appListButtonIconClasses = cx(styles['appListButtonIcon'], {
      [`${styles['hasSvg']}`]: app.applicationIconSvg
    });

    return (
      <MenuItem
        button
        className={styles['appListButton']}
        // target={app.applicationId}
        onClick={this.handleSwitchApp}
      >
        <ListItemIcon>
          {app.signedApplicationIconUrl ||
          app.applicationIconUrl ||
          app.applicationIconSvg ? (
            <img
              className={appListButtonIconClasses}
              src={
                app.signedApplicationIconUrl ||
                app.applicationIconUrl ||
                app.applicationIconSvg
              }
            />
          ) : (
            <span
              className={cx(appListButtonIconClasses, 'icon-applications')}
            />
          )}
        </ListItemIcon>
        <ListItemText primary={app.applicationName} />
      </MenuItem>
    );
  }
}
