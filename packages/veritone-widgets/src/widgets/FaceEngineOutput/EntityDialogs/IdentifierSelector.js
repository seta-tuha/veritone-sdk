import React, { Component } from 'react';
import { arrayOf, number, shape, string, bool, func } from 'prop-types';
import { get, find, uniqBy, findIndex } from 'lodash';
import { Grid as VirtualizedGrid } from 'react-virtualized';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import WarningIcon from '@material-ui/icons/Warning';
import styles from './styles.scss';

export default class IdentifierSelector extends Component {
  static propTypes = {
    identifiers: arrayOf(
      shape({
        startTimeMs: number,
        stopTimeMs: number,
        object: shape({
          label: string,
          uri: string.isRequired,
          entityId: string,
          libraryId: string
        })
      })
    ).isRequired,
    onConfirm: func.isRequired,
    onCancel: func.isRequired,
    defaultSelectAll: bool,
    isCreatingIdentifiers: bool,
    userDoesNotOwnEntity: bool,
    error: string,
    isCreatingEntity: bool
  };

  state = {
    selectedIdentifiers: this.props.defaultSelectAll
      ? this.props.identifiers
      : [],
    lastSelectedIdentifier: null,
    dontShowWarning: false
  };

  handleSelectAll = evt => {
    if (evt.target.checked) {
      this.setState({
        selectedIdentifiers: this.props.identifiers.map(identifier => {
          return {
            ...identifier,
            object: {
              ...identifier.object
            }
          };
        })
      });
    } else {
      this.setState({
        selectedIdentifiers: []
      });
    }
  };

  handleSingleIdentifierSelect = identifier => evt => {
    const { nativeEvent } = evt;
    const { identifiers } = this.props;
    if (evt.target.checked) {
      this.setState(prevState => {
        let newIdentifiers = [identifier];
        if (nativeEvent.shiftKey && prevState.lastSelectedIdentifier) {
          const selectedIndex = findIndex(identifiers, {
            guid: identifier.guid
          });
          const lastIndex = findIndex(identifiers, {
            guid: prevState.lastSelectedIdentifier.guid
          });
          newIdentifiers = identifiers.slice(
            Math.min(selectedIndex, lastIndex),
            Math.max(selectedIndex, lastIndex) + 1
          );
        }
        return {
          selectedIdentifiers: uniqBy(
            [...prevState.selectedIdentifiers, ...newIdentifiers],
            'guid'
          ),
          lastSelectedIdentifier: {
            ...identifier,
            object: {
              ...identifier.object
            }
          }
        };
      });
    } else {
      this.setState(prevState => ({
        selectedIdentifiers: prevState.selectedIdentifiers.filter(i => {
          return identifier.guid !== i.guid;
        })
      }));
    }
  };

  handleFinishClick = () => {
    this.props.onConfirm(
      this.state.selectedIdentifiers,
      this.state.dontShowWarning
    );
  };

  handleShowWarningChange = evt => {
    this.setState({
      dontShowWarning: evt.target.checked
    });
  };

  renderCell = columnCount => ({
    columnIndex,
    isScrolling,
    isVisible,
    key,
    parent,
    rowIndex,
    style
  }) => {
    const { identifiers } = this.props;
    const { selectedIdentifiers } = this.state;

    const identifier = identifiers[rowIndex * columnCount + columnIndex];
    if (!identifier) {
      return null;
    }
    return (
      <div style={style} className={styles.imageGridItem} key={key}>
        <img
          src={get(identifier, 'object.uri')}
          className={styles.identifierImage}
        />
        <span className={styles.selectFaceCheckboxBackground} />
        <Checkbox
          checked={!!find(selectedIdentifiers, { guid: identifier.guid })}
          color="primary"
          disableRipple
          classes={{ root: styles.selectFaceCheckbox }}
          onChange={this.handleSingleIdentifierSelect(identifier)}
        />
      </div>
    );
  };

  render() {
    const {
      identifiers,
      onCancel,
      isCreatingIdentifiers,
      isCreatingEntity,
      error,
      userDoesNotOwnEntity
    } = this.props;
    const { selectedIdentifiers } = this.state;
    const columnWidth = 98,
      rowHeight = 90,
      columnCount = 6;
    const rowCount = Math.ceil(identifiers.length / columnCount);
    return (
      <Grid container direction="column" spacing={0}>
        <Grid
          item
          container
          direction="column"
          wrap="nowrap"
          className={styles.identifierSelector}
        >
          {(isCreatingIdentifiers || isCreatingEntity) && (
            <Grid
              item
              container
              spacing={24}
              direction="column"
              justify="center"
              alignItems="center"
              className={styles.identifierOverlay}
            >
              <Grid item>
                <CircularProgress size={60} />
              </Grid>
              <Grid item>Processing Request</Grid>
            </Grid>
          )}
          {userDoesNotOwnEntity && (
            <Grid
              item
              container
              spacing={8}
              direction="column"
              justify="center"
              alignItems="center"
              className={styles.identifierOverlay}
            >
              <Grid item>
                <WarningIcon className={styles.warningIcon} />
              </Grid>
              <Grid item className={styles.warningText}>
                Cannot Add Images to a Shared Library
              </Grid>
              <Grid item className={styles.warningDescription}>
                This shared library is owned by another organization and cannot
                be modified. Selected images will be moved to Face Recognition
                tab only.
              </Grid>
            </Grid>
          )}
          <Grid item classes={{ item: styles.identifierSelectTitle }}>
            Which images should we use?
          </Grid>
          <Grid item classes={{ item: styles.identifierSelectInfo }}>
            Select the best images for the system to use to recognize this
            person in the future.
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  indeterminate={
                    !!selectedIdentifiers.length &&
                    selectedIdentifiers.length !== identifiers.length
                  }
                  checked={!!selectedIdentifiers.length}
                />
              }
              label={
                selectedIdentifiers.length > 0
                  ? `${selectedIdentifiers.length} Face${
                      selectedIdentifiers.length > 1 ? 's' : ''
                    } Selected`
                  : 'Select Faces'
              }
              onChange={this.handleSelectAll}
              classes={{ label: styles.selectAllCheckboxLabel }}
            />
          </Grid>
          <Grid item>
            <VirtualizedGrid
              cellRenderer={this.renderCell(columnCount)}
              width={columnCount * columnWidth}
              height={rowCount > 2 ? rowHeight * 2.2 : rowHeight * rowCount}
              columnCount={columnCount}
              columnWidth={columnWidth}
              rowCount={rowCount}
              rowHeight={rowHeight}
              overscanRowCount={3}
              className={styles.identifierImages}
              style={{
                overflowX: 'hidden'
              }}
            />
          </Grid>
        </Grid>
        <Grid item>
          {error && (
            <FormHelperText className={styles.requestError} error>
              {error}
            </FormHelperText>
          )}
        </Grid>
        <Grid
          item
          container
          justify="space-between"
          alignItems="center"
          classes={{ container: styles.identifierSelectActions }}
        >
          <Grid item>
            {userDoesNotOwnEntity && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.dontShowWarning}
                    onChange={this.handleShowWarningChange}
                    color="primary"
                  />
                }
                classes={{
                  root: styles.dontShowAgainCheckbox,
                  label: styles.dontShowAgainLabel
                }}
                label="Don't Show Again"
              />
            )}
          </Grid>
          <Grid item>
            <Button
              color="primary"
              data-veritone-element="back-button"
              classes={{ root: styles.entityDialogButton }}
              onClick={onCancel}
              disabled={isCreatingIdentifiers || isCreatingEntity}
            >
              Back
            </Button>
            <Button
              color="primary"
              data-veritone-element="finish-button"
              classes={{ root: styles.entityDialogButton }}
              onClick={this.handleFinishClick}
              disabled={isCreatingIdentifiers || isCreatingEntity}
            >
              Finish
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
