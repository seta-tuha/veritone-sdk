import React, { Component } from 'react';
import { number, string, func, shape, bool } from 'prop-types';
import classNames from 'classnames';
import { isString } from 'lodash';

import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Menu from '@material-ui/core/Menu';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

import styles from './styles.scss';

export default class SpeakerPill extends Component {
  static propTypes = {
    className: string,
    speakerSegment: shape({
      speakerId: string,
      startTimeMs: number,
      stopTimeMs: number,
      guid: string
    }).isRequired,
    editMode: bool,
    onChange: func,
    onClick: func,
    startMediaPlayHeadMs: number,
    stopMediaPlayHeadMs: number
  };

  state = {
    showMenuButton: false,
    anchorEl: null,
    applyAll: false,
    speakerName: ''
  };

  componentDidMount() {
    const { speakerSegment } = this.props;
    this.state.speakerName = speakerSegment.speakerId;
  }

  static defaultProps = {
    startMediaPlayHeadMs: 0,
    stopMediaPlayHeadMs: 1000
  };

  handlePillClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.speakerSegment);
    }
  };

  handleMouseEnter = () => {
    this.setState({ showMenuButton: true });
  };

  handleMouseLeave = () => {
    this.setState({ showMenuButton: false });
  };

  handleMenuOpen = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  handleClickApplyAll = () => {
    const { applyAll } = this.state;
    this.setState({ applyAll: !applyAll });
  };

  handleNameInputChange = event => {
    const value = event.target.value;
    this.setState({ speakerName: value });
  };

  handleAddClick = () => {

  };

  handleRemoveClick = () => {

  };

  render() {
    const {
      editMode,
      speakerSegment,
      speakerData,
      startMediaPlayHeadMs,
      stopMediaPlayHeadMs
    } = this.props;
    const {
      speakerId,
      startTimeMs,
      stopTimeMs,
      guid
    } = speakerSegment;
    const {
      showMenuButton,
      anchorEl,
      applyAll,
      isSet,
      speakerName
    } = this.state;

    const extractPillLabel = speakerId => {
      if (isString(speakerId) && speakerId.length > 2) {
        return speakerId.split(' ')
          .map(part => part.slice(0, 1))
          .join('')
          .toUpperCase();
      }
      return speakerId;
    };
    const extractLabel = speakerId => {
      if (isString(speakerId) && speakerId.length > 2) {
        return speakerId.split(' ')
          .map(part => part.slice(0, 1))
          .join('')
          .toUpperCase();
      }
      return 'Speaker ' + speakerId;
    };

    const speakerKey = guid ? guid : `speaker-pill-${speakerId}-${startTimeMs}-${stopTimeMs}`;
    const isHighlighted = !(stopMediaPlayHeadMs < startTimeMs || startMediaPlayHeadMs > stopTimeMs);
    const colorClass = isHighlighted ? styles.highlight : '';
    const speakerPillLabel = extractPillLabel(speakerId);
    const speakerLabel = extractLabel(speakerId);

    return (
      <div
        className={ this.props.className }
        onMouseEnter={ this.handleMouseEnter }
        onMouseLeave={ this.handleMouseLeave }>
        <Tooltip title={speakerLabel} placement="bottom-end">
          <Chip
            className={ classNames(styles.speakerPill, colorClass) }
            key={ speakerKey }
            label={ speakerPillLabel }
            onClick={ this.handlePillClick }
            clickable
          />
        </Tooltip>
        {
          (editMode && showMenuButton) ?
            (
              <IconButton
                className={ styles.editButton }
                disableRipple
                onClick={this.handleMenuOpen}>
                <EditIcon 
                  className={ styles.editIcon }/>
              </IconButton>
            ) : null
        }
        <Menu
          MenuListProps={{ className: styles.speakerMenu }}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleMenuClose}>
          <ListItem
            className={styles.speakerMenuItem}
            dense
            button
            disableRipple
            onClick={this.handleClickApplyAll}>
            <Checkbox
              color="primary"
              disableRipple
              checked={applyAll} />
            <ListItemText primary={`Apply to all "${speakerLabel}"`} />
          </ListItem>
          <ListItem
            className={styles.speakerMenuItem}
            dense
            >
            <FormControl className={styles.speakerInputContainer}>
              <InputLabel
                className={styles.speakerInputLabel}
                htmlFor={`name-input-${speakerKey}`}>
                Speaker Name
              </InputLabel>
              <Input
                className={styles.speakerInput}
                id={`name-input-${speakerKey}`}
                type="text"
                onChange={this.handleNameInputChange}
                value={speakerName}
                endAdornment={
                  speakerName !== speakerId ? (
                    <Button
                      className={styles.speakerInputButton}
                      disabled={!speakerName}
                      disableRipple
                      color="primary"
                      size="small"
                      onClick={this.handleAddClick}>
                      Add
                    </Button>
                  ) : (
                    <Button
                      className={styles.speakerInputButton}
                      disabled={!speakerName}
                      disableRipple
                      color="primary"
                      size="small"
                      onClick={this.handleRemoveClick}>
                      Remove
                    </Button>
                  )
                } />
            </FormControl>
          </ListItem>
          <ListItem
            className={ classNames(styles.speakerMenuItem, styles.darkMenuSection) }
            dense>
            <span
              className={styles.speakerMenuAvailableHeader}>
              Available Speakers
            </span>
          </ListItem>
        </Menu>
      </div>
    );
  }
};