import React, { Component, Fragment } from 'react';
import { number, bool, string, func, shape, arrayOf, node } from 'prop-types';
import { get, isEqual, orderBy, pick } from 'lodash';

import { connect } from 'react-redux';
import { modules, util } from 'veritone-redux-common';
import * as TranscriptRedux from '../../redux/modules/mediaDetails/transcriptWidget';
import transcriptSaga, {
  changeWidthDebounce
} from '../../redux/modules/mediaDetails/transcriptWidget/saga';
import {
  AlertDialog,
  TranscriptEngineOutput,
  TranscriptEditMode,
  EngineOutputNullState
} from 'veritone-react-common';
import Button from '@material-ui/core/Button/Button';
import styles from '../MediaDetails/styles.scss';
import Snackbar from '@material-ui/core/Snackbar/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

const { engineResults: engineResultsModule } = modules;

const saga = util.reactReduxSaga.saga;

@saga(transcriptSaga)
@connect(
  (state, { tdo, selectedEngineId }) => ({
    selectedCombineEngineId: TranscriptRedux.getSelectedCombineEngineId(state),
    selectedCombineViewTypeId: TranscriptRedux.selectedCombineViewTypeId(state),
    hasUserEdits: TranscriptRedux.hasUserEdits(state),
    currentData: TranscriptRedux.currentData(state),
    isDisplayingUserEditedOutput: engineResultsModule.isDisplayingUserEditedOutput(
      state,
      tdo.id,
      selectedEngineId
    ),
    selectedEngineResults: engineResultsModule.engineResultsByEngineId(
      state,
      tdo.id,
      selectedEngineId
    ),
    selectedCombineEngineResults: engineResultsModule.engineResultsByEngineId(
      state,
      tdo.id,
      TranscriptRedux.getSelectedCombineEngineId(state)
    ),
    showTranscriptBulkEditSnack: TranscriptRedux.getShowTranscriptBulkEditSnack(
      state
    ),
    error: TranscriptRedux.getError(state),
    savingTranscript: TranscriptRedux.getSavingTranscriptEdits(state),
    editModeEnabled: TranscriptRedux.getEditModeEnabled(state),
    showConfirmationDialog: TranscriptRedux.showConfirmationDialog(state),
    confirmationType: TranscriptRedux.getConfirmationType(state),
    combineCategory: TranscriptRedux.combineCategory(state),
    combineViewTypes: TranscriptRedux.getCombineViewTypes(state),
    isFetchingEngineResults: engineResultsModule.isFetchingEngineResults(state)
  }),
  {
    //undo: TranscriptRedux.undo,           //Uncomment when needed to enable undo option
    //redo: TranscriptRedux.redo,           //Uncomment when needed to enable redo option
    change: changeWidthDebounce,
    reset: TranscriptRedux.reset,
    receiveData: TranscriptRedux.receiveData,
    fetchEngineResults: engineResultsModule.fetchEngineResults,
    clearEngineResultsByEngineId:
      engineResultsModule.clearEngineResultsByEngineId,
    onEditButtonClick: TranscriptRedux.editTranscriptButtonClick,
    saveTranscriptEdit: TranscriptRedux.saveTranscriptEdit,
    setShowTranscriptBulkEditSnackState:
      TranscriptRedux.setShowTranscriptBulkEditSnackState,
    closeErrorSnackbar: TranscriptRedux.closeErrorSnackbar,
    toggleEditMode: TranscriptRedux.toggleEditMode,
    openConfirmationDialog: TranscriptRedux.openConfirmationDialog,
    closeConfirmationDialog: TranscriptRedux.closeConfirmationDialog,
    setSelectedCombineEngineId: TranscriptRedux.setSelectedCombineEngineId,
    setSelectedCombineViewTypeId: TranscriptRedux.setSelectedCombineViewTypeId
  },
  null,
  { withRef: true }
)
export default class TranscriptEngineOutputContainer extends Component {
  static propTypes = {
    tdo: shape({
      id: string,
      startDateTime: string,
      stopDateTime: string
    }).isRequired,
    selectedEngineResults: arrayOf(
      shape({
        sourceEngineId: string.isRequired,
        series: arrayOf(
          shape({
            startTimeMs: number.isRequired,
            stopTimeMs: number.isRequired,
            words: arrayOf(
              shape({
                word: string.isRequired,
                confidence: number.isRequired
              })
            ),
            object: shape({
              label: string,
              type: string,
              uri: string,
              entityId: string,
              libraryId: string,
              confidence: number,
              text: string
            }),
            boundingPoly: arrayOf(
              shape({
                x: number,
                y: number
              })
            )
          })
        )
      })
    ),
    isFetchingEngineResults: bool,
    selectedCombineEngineResults: arrayOf(
      shape({
        sourceEngineId: string.isRequired,
        series: arrayOf(
          shape({
            startTimeMs: number.isRequired,
            stopTimeMs: number.isRequired,
            speakerId: string
          })
        )
      })
    ),
    currentData: arrayOf(
      shape({
        startTimeMs: number,
        stopTimeMs: number,
        series: arrayOf(shape({}))
      })
    ),

    selectedEngineId: string,
    engines: arrayOf(
      shape({
        id: string,
        name: string
      })
    ),
    combineEngines: shape({
      speaker: arrayOf(
        shape({
          id: string,
          name: string
        })
      )
    }),
    combineViewTypes: arrayOf(
      shape({
        name: string.isRequired,
        id: string.isRequired
      })
    ),
    combineCategory: string,
    selectedCombineEngineId: string,
    setSelectedCombineEngineId: func,
    selectedCombineViewTypeId: string,
    setSelectedCombineViewTypeId: func,
    title: string,

    className: string,
    headerClassName: string,
    contentClassName: string,

    editMode: bool,

    onClick: func,
    onScroll: func,
    onEngineChange: func,
    onExpandClick: func,
    onRestoreOriginalClick: func,

    mediaLengthMs: number,
    neglectableTimeMs: number,
    estimatedDisplayTimeMs: number,

    mediaPlayerTimeMs: number,
    mediaPlayerTimeIntervalMs: number,

    //undo: func,     //Uncomment when needed to enable undo option
    //redo: func,     //Uncomment when needed to enable redo option
    reset: func.isRequired,
    change: func.isRequired,
    receiveData: func.isRequired,
    hasUserEdits: bool,
    outputNullState: node,
    bulkEditEnabled: bool,

    fetchEngineResults: func,
    isDisplayingUserEditedOutput: bool,
    clearEngineResultsByEngineId: func,
    moreMenuItems: arrayOf(node),
    showEditButton: bool,
    onEditButtonClick: func,
    disableEditButton: bool,
    saveTranscriptEdit: func,
    setShowTranscriptBulkEditSnackState: func,
    showTranscriptBulkEditSnack: bool,
    error: string,
    closeErrorSnackbar: func,
    savingTranscript: bool,
    toggleEditMode: func,
    editModeEnabled: bool,
    showConfirmationDialog: bool,
    openConfirmationDialog: func,
    closeConfirmationDialog: func,
    confirmationType: string
  };

  state = {
    editType: TranscriptEditMode.SNIPPET,
    confirmEditType: null,
    props: this.props
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextData = get(nextProps, 'selectedEngineResults');
    nextData &&
      nextData.map(chunk => {
        chunk.series &&
          chunk.series.map(snippet => {
            const words = snippet.words;
            words && (snippet.words = orderBy(words, ['confidence'], ['desc']));
          });
      });

    const prevProps = prevState.props;
    !isEqual(prevProps.selectedEngineResults, nextData) &&
      prevProps.receiveData(nextData);
    return { ...prevState, props: nextProps };
  }

  componentDidMount() {
    const {
      tdo,
      combineEngines,
      combineCategory,
      selectedCombineEngineId,
      setSelectedCombineEngineId,
      fetchEngineResults,
      setSelectedCombineViewTypeId
    } = this.props;
    const speakerEngines = get(combineEngines, combineCategory);

    if (
      !selectedCombineEngineId &&
      speakerEngines &&
      speakerEngines.length
    ) {
      const speakerEngineId = speakerEngines[0].id;
      fetchEngineResults({
        engineId: speakerEngineId,
        tdo: tdo,
        startOffsetMs: 0,
        stopOffsetMs:
          Date.parse(tdo.stopDateTime) - Date.parse(tdo.startDateTime)
      }).then(response => {
        setSelectedCombineEngineId(speakerEngineId);
        setSelectedCombineViewTypeId('speaker-view');
        return response;
      });
    }
  }

  componentWillUnmount() {
    const {
      editModeEnabled,
      toggleEditMode,
      selectedCombineEngineId,
      setSelectedCombineEngineId,
      selectedCombineViewTypeId,
      setSelectedCombineViewTypeId
    } = this.props;

    if (editModeEnabled) {
      toggleEditMode();
    }
    if (selectedCombineEngineId) {
      setSelectedCombineEngineId(null);
    }
    if (selectedCombineViewTypeId) {
      setSelectedCombineViewTypeId('transcript');
    }
  }

  handleSpeakerEngineChange = engineId => {
    const tdo = this.props.tdo;
    if (engineId !== this.props.selectedCombineEngineId) {
      this.props.fetchEngineResults({
        engineId: engineId,
        tdo: tdo,
        startOffsetMs: 0,
        stopOffsetMs:
          Date.parse(tdo.stopDateTime) - Date.parse(tdo.startDateTime)
      }).then(response => {
        this.props.setSelectedCombineEngineId(engineId);
        return response;
      });
    }
  }

  handleContentChanged = value => {
    this.props.change(value);
  };

  handleOnEditTypeChange = value => {
    if (this.props.editModeEnabled && this.props.hasUserEdits) {
      this.setState(
        {
          confirmEditType: value.type
        },
        () => {
          this.props.openConfirmationDialog('cancelEdits');
        }
      );
    } else {
      this.setState({
        editType: value.type
      });
    }
  };

  handleToggleEditedOutput = showUserEdited => {
    const tdo = this.props.tdo;
    this.props.clearEngineResultsByEngineId(
      tdo.id,
      this.props.selectedEngineId
    );
    this.props.fetchEngineResults({
      engineId: this.props.selectedEngineId,
      tdo: tdo,
      startOffsetMs: 0,
      stopOffsetMs:
        Date.parse(tdo.stopDateTime) - Date.parse(tdo.startDateTime),
      ignoreUserEdited: !showUserEdited
    });
  };

  onSaveEdits = () => {
    const { tdo, selectedEngineId, fetchEngineResults } = this.props;
    this.props.saveTranscriptEdit(tdo.id, selectedEngineId).then(res => {
      fetchEngineResults({
        engineId: selectedEngineId,
        tdo: tdo,
        startOffsetMs: 0,
        stopOffsetMs:
          Date.parse(tdo.stopDateTime) - Date.parse(tdo.startDateTime),
        ignoreUserEdited: false
      });
      this.props.toggleEditMode();
      return res;
    });
  };

  handleDialogCancel = () => {
    const {
      closeConfirmationDialog,
      reset,
      confirmationType,
      toggleEditMode
    } = this.props;

    if (confirmationType === 'saveEdits') {
      reset();
      toggleEditMode();
    }
    closeConfirmationDialog();
  };

  checkEditState = () => {
    if (this.props.editModeEnabled && this.props.hasUserEdits) {
      this.props.openConfirmationDialog('saveEdits');
    } else {
      this.props.toggleEditMode();
    }
  };

  handleDialogConfirm = () => {
    const { closeConfirmationDialog, reset, confirmationType } = this.props;

    if (confirmationType === 'saveEdits') {
      this.onSaveEdits();
    } else if (confirmationType === 'cancelEdits') {
      this.setState(prevState => ({
        editType: prevState.confirmEditType,
        confirmEditType: null
      }));
      reset();
    }
    closeConfirmationDialog();
  };

  closeTranscriptBulkEditSnack = () => {
    this.props.setShowTranscriptBulkEditSnackState(false);
  };

  determineSpeakerNullstate = () => {
    const {
      selectedCombineEngineId,
      selectedCombineEngineResults,
      selectedCombineViewTypeId,
      combineCategory,
      combineEngines,
      outputNullState,
      isFetchingEngineResults
    } = this.props;
    const speakerEngines = get(combineEngines, combineCategory, []);
    const combineEngineTask = speakerEngines
      .find(engine => engine.id === selectedCombineEngineId);

    if (combineEngineTask && selectedCombineViewTypeId == 'speaker-view') {
      let combineStatus = combineEngineTask.status;
      if (isFetchingEngineResults) {
        combineStatus = 'fetching';
      } else if (!selectedCombineEngineResults && combineStatus === 'complete') {
        combineStatus = 'no_data';
      } else if (selectedCombineEngineResults && combineStatus === 'complete') {
        return outputNullState;
      }
      return outputNullState || (
        <EngineOutputNullState
          engineStatus={combineStatus}
          engineName={combineEngineTask.name}
        />
      );
    }
    return outputNullState;
  };

  render() {
    const transcriptEngineProps = pick(this.props, [
      'title',
      'engines',
      'selectedEngineId',
      'className',
      'headerClassName',
      'contentClassName',
      'editMode',
      'onClick',
      'onScroll',
      'onExpandClick',
      'onRestoreOriginalClick',
      'mediaLengthMs',
      'neglectableTimeMs',
      'estimatedDisplayTimeMs',
      'mediaPlayerTimeMs',
      'mediaPlayerTimeIntervalMs',
      'moreMenuItems',
      'disableEditButton',
      'onEngineChange',
      'combineViewTypes',
      'selectedCombineViewTypeId'
    ]);

    const bulkEditEnabled = this.props.selectedCombineViewTypeId === 'speaker-view' ?
      false : this.props.bulkEditEnabled;

    const outputNullState = this.determineSpeakerNullstate();

    const alertTitle = 'Unsaved Changes';
    let alertDescription =
      'This action will reset your changes to the transcript.';
    let cancelButtonLabel = 'Cancel';
    let approveButtonLabel = 'Continue';

    if (this.props.confirmationType === 'saveEdits') {
      alertDescription = 'Would you like to save the changes?';
      cancelButtonLabel = 'Discard';
      approveButtonLabel = 'Save';
    }

    const speakerEngines = get(this.props, ['combineEngines', this.props.combineCategory], []);

    return (
      <Fragment>
        <TranscriptEngineOutput
          data={this.props.currentData}
          {...transcriptEngineProps}
          bulkEditEnabled={bulkEditEnabled}
          editMode={this.props.editModeEnabled}
          onChange={this.handleContentChanged}
          onCombineEngineChange={this.handleSpeakerEngineChange}
          editType={this.state.editType}
          showEditButton={
            this.props.showEditButton && !this.props.editModeEnabled
          }
          onEditButtonClick={this.props.toggleEditMode}
          onEditTypeChange={this.handleOnEditTypeChange}
          showingUserEditedOutput={this.props.isDisplayingUserEditedOutput}
          onToggleUserEditedOutput={this.handleToggleEditedOutput}
          speakerEngines={speakerEngines}
          speakerData={this.props.selectedCombineEngineResults}
          selectedSpeakerEngineId={this.props.selectedCombineEngineId}
          handleCombineViewTypeChange={this.props.setSelectedCombineViewTypeId}
          outputNullState={outputNullState}
        />
        {this.props.editModeEnabled && (
          <div className={styles.actionButtonsEditMode}>
            <Button
              className={styles.actionButtonEditMode}
              onClick={this.checkEditState}
              disabled={this.props.savingTranscript}
            >
              CANCEL
            </Button>
            <Button
              className={styles.actionButtonEditMode}
              onClick={this.onSaveEdits}
              disabled={!this.props.hasUserEdits || this.props.savingTranscript}
              variant="contained"
              color="primary"
            >
              SAVE
            </Button>
          </div>
        )}
        <AlertDialog
          open={this.props.showConfirmationDialog}
          titleLabel={alertTitle}
          content={alertDescription}
          cancelButtonLabel={cancelButtonLabel}
          approveButtonLabel={approveButtonLabel}
          onCancel={this.handleDialogCancel}
          onApprove={this.handleDialogConfirm}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.props.showTranscriptBulkEditSnack}
          autoHideDuration={5000}
          onClose={this.closeTranscriptBulkEditSnack}
          message={
            <span className={styles.snackbarMessageText}>
              {`Bulk edit transcript will run in the background and may take some time to finish.`}
            </span>
          }
        />
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={!!this.props.error}
          autoHideDuration={5000}
          onClose={this.props.closeErrorSnackbar}
        >
          <SnackbarContent
            className={styles.errorSnackbar}
            message={
              <span className={styles.snackbarMessageText}>
                {this.props.error}
              </span>
            }
          />
        </Snackbar>
      </Fragment>
    );
  }
}
