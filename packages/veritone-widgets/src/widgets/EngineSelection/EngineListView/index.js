import React from 'react';
import { connect } from 'react-redux';
import {
  bool,
  func,
  objectOf,
  object,
  arrayOf,
  string,
  shape,
  number
} from 'prop-types';
import { isEmpty } from 'lodash';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import { withMuiThemeProvider } from 'veritone-react-common';
import { modules } from 'veritone-redux-common';
const { engine: engineModule } = modules;

import SelectBar from './SelectBar/';
import EnginesSideBar from './SideBar';
import SelectedActionBar from './SelectedActionBar/';
import EngineListContainer from './EngineListContainer';

import * as engineSelectionModule from '../../../redux/modules/engineSelection';

import styles from './styles.scss';

@connect(
  (state, ownProps) => ({
    allEngines: engineModule.getEngines(state),
    currentResults: engineSelectionModule.getCurrentResults(state),
    allEnginesChecked: engineSelectionModule.allEnginesChecked(state),
    selectedEngineIds: engineSelectionModule.getSelectedEngineIds(state),
    checkedEngineIds: engineSelectionModule.getCheckedEngineIds(state),
    isFetchingEngines: engineModule.isFetchingEngines(state),
    failedToFetchEngines: engineModule.failedToFetchEngines(state),
    searchQuery: engineSelectionModule.getSearchQuery(state),
    currentTabIndex: engineSelectionModule.getCurrentTabIndex(state),
    isSearchOpen: engineSelectionModule.isSearchOpen(state)
  }),
  {
    selectEngines: engineSelectionModule.selectEngines,
    deselectEngines: engineSelectionModule.deselectEngines,
    searchEngines: engineSelectionModule.searchEngines,
    checkAllEngines: engineSelectionModule.checkAllEngines,
    uncheckAllEngines: engineSelectionModule.uncheckAllEngines,
    clearSearch: engineSelectionModule.clearSearch,
    changeTab: engineSelectionModule.changeTab,
    toggleSearch: engineSelectionModule.toggleSearch
  }
)
@withMuiThemeProvider
export default class EngineListView extends React.Component {
  static propTypes = {
    allEngines: objectOf(object),
    currentResults: arrayOf(string),
    allEnginesChecked: bool.isRequired,
    selectedEngineIds: arrayOf(string).isRequired,
    checkedEngineIds: arrayOf(string).isRequired,
    initialSelectedEngineIds: arrayOf(string),
    onViewDetail: func.isRequired,
    searchQuery: string,
    isFetchingEngines: bool.isRequired,
    failedToFetchEngines: bool.isRequired,
    currentTabIndex: number.isRequired,
    isSearchOpen: bool.isRequired,
    selectEngines: func.isRequired,
    deselectEngines: func.isRequired,
    searchEngines: func.isRequired,
    checkAllEngines: func.isRequired,
    uncheckAllEngines: func.isRequired,
    clearSearch: func.isRequired,
    changeTab: func.isRequired,
    toggleSearch: func.isRequired,
    onSave: func.isRequired,
    onCancel: func.isRequired,
    actionMenuItems: arrayOf(
      shape({
        buttonText: string,
        iconClass: string,
        onClick: func.isRequired
      })
    ),
    hideActions: bool
  };

  static defaultProps = {
    allEngines: {},
    currentResults: []
  };

  state = {};

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      isEmpty(prevProps.allEngines) &&
      !isEmpty(this.props.allEngines) &&
      this.props.initialSelectedEngineIds
    ) {
      this.props.selectEngines(this.props.initialSelectedEngineIds);
    }
  }

  handleCheckAll = () => {
    const enginesToCheck = this.props.currentTabIndex
      ? this.props.currentResults
      : this.props.selectedEngineIds;

    this.props.allEnginesChecked
      ? this.props.uncheckAllEngines()
      : this.props.checkAllEngines(enginesToCheck);
  };

  handleSearch = name => {
    this.props.searchEngines({ name });
  };

  handleTabChange = (event, tabIndex) => {
    this.props.changeTab(tabIndex);
  };

  handleSave = () => {
    this.props.onSave();
  };

  render() {
    const { checkedEngineIds, currentTabIndex } = this.props;

    return (
      <div className={styles.engineSelection}>
        <EnginesSideBar />
        <div className={styles.engineSelectionContent}>
          {!isEmpty(checkedEngineIds) && (
            <SelectedActionBar
              selectedEngines={checkedEngineIds}
              disabledSelectAllMessage={!currentTabIndex}
              currentResultsCount={this.props.currentResults.length}
              onBack={this.props.uncheckAllEngines}
              onAddSelected={this.props.selectEngines}
              onRemoveSelected={this.props.deselectEngines}
              onSelectAll={this.props.checkAllEngines}
              allEngines={Object.keys(this.props.allEngines)}
            />
          )}
          {isEmpty(checkedEngineIds) && (
            <Tabs
              className={styles.tabs}
              value={this.props.currentTabIndex}
              onChange={this.handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              fullWidth
            >
              <Tab classes={{ selected: styles.tab }} label="Your Engines" />
              <Tab
                classes={{ selected: styles.tab }}
                label="Explore All Engines"
              />
            </Tabs>
          )}
          <div className={styles.engineListContainer}>
            <SelectBar
              onCheckAll={this.handleCheckAll}
              searchQuery={this.props.searchQuery}
              onSearch={this.handleSearch}
              onClearSearch={this.props.clearSearch}
              onToggleSearch={this.props.toggleSearch}
              isSearchOpen={this.props.isSearchOpen}
              isChecked={this.props.allEnginesChecked}
              actionMenuItems={this.props.actionMenuItems}
              hideActionMenuItems={
                this.props.failedToFetchEngines || !currentTabIndex
              }
              count={
                currentTabIndex
                  ? this.props.currentResults.length
                  : this.props.selectedEngineIds.length
              }
            />
            <div className={styles.engineList}>
              <EngineListContainer
                currentTabIndex={this.props.currentTabIndex}
                engineIds={
                  currentTabIndex
                    ? this.props.currentResults
                    : this.props.selectedEngineIds
                }
                onViewDetail={this.props.onViewDetail}
                isFetchingEngines={this.props.isFetchingEngines}
                failedToFetchEngines={this.props.failedToFetchEngines}
                onExploreAllEnginesClick={this.handleTabChange}
              />
            </div>
            {!this.props.hideActions && (
              <div className={styles.footer}>
                <Button
                  classes={{ label: styles.footerBtn }}
                  onClick={this.props.onCancel}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  classes={{ label: styles.footerBtn }}
                  onClick={this.handleSave}
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
