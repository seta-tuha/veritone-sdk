import React from 'react';
import cx from 'classnames';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle
} from 'material-ui/Dialog';
import { FormControlLabel, FormHelperText } from 'material-ui/Form';
import Switch from 'material-ui/Switch'
import styles from './styles.scss';
import { arrayOf, bool, func, string, date, shape } from 'prop-types';


import { getUTCDate } from 'helpers/date';
import {
  parse,
  addHours,
  addMinutes,
  startOfHour,
  endOfHour,
} from 'date-fns';
import format from 'date-fns/format';

import TextField from 'material-ui/TextField';

import ModalSubtitle from '../ModalSubtitle';
import Typography from 'material-ui/Typography';

export default class TimeSearchModal extends React.Component {
  static propTypes = {
    open: bool,
    modalState: shape({
      search: shape({
        dayPartStartTime: date,
        dayPartEndTime: date,
        stationBroadcastTime: bool,
        selectedDays: arrayOf(bool)
      })
    }),
    cancel: func
  };
  static defaultProps = {
    cancel: () => console.log('You clicked cancel')
  };

  copyFilter = searchFilter => {
    const copy = Object.assign({}, searchFilter);
    copy.selectedDays = Object.assign([], searchFilter.selectedDays);
    return copy;
  };

  initializeState = (initialValue) => {
    const filterValue = this.copyFilter(initialValue);
    if(filterValue.stationBroadcastTime === false) {
      filterValue.dayPartStartTime = fromUTCToLocal(filterValue.dayPartStartTime);
      filterValue.dayPartEndTime = fromUTCToLocal(filterValue.dayPartEndTime);
    }
    return filterValue;
  }

  state = {
    filterValue: this.initializeState(this.props.modalState.search)
  };

  onDayPartStartTimeChange = event => {
    this.setState({
      filterValue: {
        ...this.state.filterValue,
        dayPartStartTime: event.target.value
      }
    });
  };

  onDayPartEndTimeChange = event => {
    this.setState({
      filterValue: {
        ...this.state.filterValue,
        dayPartEndTime: event.target.value
      }
    });
  };

  onStationBroadcastTimeChange = event => {
    this.setState({
      filterValue: {
        ...this.state.filterValue,
        stationBroadcastTime: event.target.checked
      }
    });
  };

  onDayOfWeekSelectionChange = event => {
    const selectedDays = [...this.state.filterValue.selectedDays];
    selectedDays[Number(event.target.value)] = event.target.checked;
    this.setState({
      filterValue: {
        ...this.state.filterValue,
        selectedDays
      }
    });
  };

  returnValue() {
    if (
      !this.state.filterValue ||
      !this.state.filterValue.dayPartStartTime ||
      !this.state.filterValue.dayPartEndTime
    ) {
      return
    } else {
      const filterValue = this.copyFilter(this.state.filterValue);
      // station broadcast time is false, convert time to UTC (apply the -timezone)
      if(filterValue.stationBroadcastTime === false) {
        filterValue.dayPartStartTime = fromLocalToUTC(filterValue.dayPartStartTime);
        filterValue.dayPartEndTime = fromLocalToUTC(filterValue.dayPartEndTime);
      }
      return {
        search: filterValue
      };
    }
  }

  render() {
    return (
      <TimeSearchForm
        cancel={this.props.cancel}
        onDayPartStartTimeChange={this.onDayPartStartTimeChange}
        onDayPartEndTimeChange={this.onDayPartEndTimeChange}
        onStationBroadcastTimeChange={this.onStationBroadcastTimeChange}
        onDayOfWeekSelectionChange={this.onDayOfWeekSelectionChange}
        inputValue={this.state.filterValue}
      />
    );
  }
}

const daysOfTheWeek = [
  {
    isoWeekday: 1,
    name: 'Monday'
  }, // MONDAY
  {
    isoWeekday: 2,
    name: 'Tuesday'
  },
  {
    isoWeekday: 3,
    name: 'Wednesday'
  },
  {
    isoWeekday: 4,
    name: 'Thursday'
  },
  {
    isoWeekday: 5,
    name: 'Friday'
  },
  {
    isoWeekday: 6,
    name: 'Saturday'
  },
  {
    isoWeekday: 7,
    name: 'Sunday'
  } // SUNDAY
];

export const TimeSearchForm = ({
  cancel,
  onDayPartStartTimeChange,
  onDayPartEndTimeChange,
  onStationBroadcastTimeChange,
  onDayOfWeekSelectionChange,
  inputValue
}) => {
  const asterisk = !inputValue.stationBroadcastTime ? '*' : '';
  return (
      <div className={cx(styles['timeSearchConfigContent'])}>
        <div className={cx(styles['timeSelectSection'])}>
          <div className={cx(styles['timeSelectSection'])}>
            <div className={cx(styles['timeInputSection'])}>
              <TextField
                label={'Start Time' + asterisk}
                InputLabelProps={{
                  shrink: true
                }}
                autoFocus
                className="dayPartStartTimeInput"
                type="time"
                min="00:00"
                max="23:59"
                value={inputValue.dayPartStartTime}
                onChange={onDayPartStartTimeChange}
              />
            </div>
            <div className={cx(styles['timeInputSection'])}>
              <TextField
                label={'End Time' + asterisk}
                InputLabelProps={{
                  shrink: true
                }}
                className="dayPartEndTimeInput"
                type="time"
                min="00:00"
                max="23:59"
                value={inputValue.dayPartEndTime}
                onChange={onDayPartEndTimeChange}
              />
            </div>
          </div>
          <div className={cx(styles['stationSwitchSection'])}>
            <FormControlLabel
              control={
                <Switch
                  className="stationBroadcastSwitch"
                  checked={inputValue.stationBroadcastTime}
                  onChange={onStationBroadcastTimeChange}
                />
              }
              label="Station Broadcast Time"
            />
            <Typography variant="caption" color="textSecondary" gutterBottom>
              Display results against all timezones for this time range.
            </Typography>
          </div>
        </div>
        {inputValue.stationBroadcastTime && (
          <div className={cx(styles['dayOfWeekConfig'])}>
            <h4>Day of the Week</h4>
            <div className={cx(styles['dayOfWeekSelection'])}>
              {daysOfTheWeek.map(dayOfTheWeek => (
                <FormControlLabel
                  key={dayOfTheWeek.isoWeekday}
                  control={
                    <Checkbox
                      checked={
                        inputValue.selectedDays[dayOfTheWeek.isoWeekday - 1]
                      }
                      onChange={onDayOfWeekSelectionChange}
                      value={String(dayOfTheWeek.isoWeekday - 1)}
                    />
                  }
                  label={dayOfTheWeek.name}
                />
              ))}
            </div>
          </div>
        )}
        {!inputValue.stationBroadcastTime && (
          <label>
            <Typography variant="caption" color="textSecondary" gutterBottom>
              *{
                new Date()
                  .toLocaleTimeString('en-us', { timeZoneName: 'long' })
                  .split(' ')[2]
              }{' '}
              Time Zone
            </Typography>
          </label>
        )}
      </div>
  );
};

TimeSearchModal.defaultProps = {
  modalState: {
    search: {
      dayPartStartTime: format(startOfHour(addHours( new Date(), -1), new Date().getTimezoneOffset()), 'HH:mm'),
      dayPartEndTime: format(endOfHour(addHours( new Date(), -1), new Date().getTimezoneOffset()), 'HH:mm'),
      stationBroadcastTime: false,
      selectedDays: [true, true, true, true, true, true, true]
    }
  }
};

const TimeDisplay = modalState => {
  let abbreviationMessage = '';
  if (modalState.search.dayPartStartTime && modalState.search.dayPartEndTime) {
    let dayPartStartTime = modalState.search.dayPartStartTime;
    let dayPartEndTime = modalState.search.dayPartEndTime;

    if(modalState.search.stationBroadcastTime === false) {
      dayPartStartTime = fromUTCToLocal(dayPartStartTime);
      dayPartEndTime = fromUTCToLocal(dayPartEndTime);
    }
    const startTime = format(new Date().toDateString() + " " + dayPartStartTime, 'hh:mm A');
    const endTime = format(new Date().toDateString() + " " + dayPartEndTime, 'hh:mm A');

    abbreviationMessage = `${startTime}-${endTime}`;
    if (modalState.search.stationBroadcastTime) {
      const selectedDays = daysOfTheWeek
        .filter(
          dayOfTheWeek =>
            modalState.search.selectedDays[dayOfTheWeek.isoWeekday - 1]
        )
        .map(dayOfTheWeek => dayOfTheWeek.name)
        .join();
      abbreviationMessage += selectedDays.length ? ` (${selectedDays})` : '';
    }
  }
  return {
    abbreviation:
      abbreviationMessage.length > 10
        ? abbreviationMessage.substring(0, 10) + '...'
        : abbreviationMessage,
    thumbnail: null
  };
};

const fromLocalToUTC = (inputTime) => {
  const converted = parse(new Date().toDateString() + ' ' + inputTime);
  return format(addMinutes(converted, new Date().getTimezoneOffset()), 'HH:mm');
};

const fromUTCToLocal = (inputTime) => {
  const converted = parse(new Date().toDateString() + ' ' + inputTime + ":00Z");
  return format(converted, 'HH:mm');
};

export { TimeSearchModal, TimeDisplay };
