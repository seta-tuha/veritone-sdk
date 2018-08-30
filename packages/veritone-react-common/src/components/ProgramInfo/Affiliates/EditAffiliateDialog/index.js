import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import { get, mapValues, omit, difference, keys, constant } from 'lodash';
import { subDays, format } from 'date-fns';
import { string, func, shape, objectOf, bool } from 'prop-types';
import EditAffiliateForm from './EditAffiliateForm.js';
import styles from './styles.scss';

const initDate = new Date();

export default class EditAffiliateDialog extends Component {
  static propTypes = {
    affiliate: shape({
      id: string.isRequired,
      name: string.isRequired,
      schedule: shape({
        scheduleType: string,
        start: string,
        end: string,
        repeatEvery: shape({
          number: string,
          period: string
        }),
        weekly: shape({
          selectedDays: objectOf(bool)
        })
      }).isRequired
    }),
    onSave: func.isRequired,
    onClose: func.isRequired
  };

  static defaultProps = {
    affiliate: {}
  };

  state = {
    affiliate: {
      ...this.props.affiliate,
      schedule: {
        // This provides defaults to the form. Shallow merged with
        // props.initialValues to allow overriding.
        scheduleType: get(
          this.props.affiliate.schedule,
          'scheduleType',
          'Recurring'
        ),
        start: get(this.props.affiliate.schedule, 'start')
          ? format(new Date(this.props.affiliate.schedule.start), 'YYYY-MM-DD')
          : format(subDays(initDate, 3), 'YYYY-MM-DD'),
        end: get(this.props.affiliate.schedule, 'end')
          ? format(new Date(this.props.affiliate.schedule.end), 'YYYY-MM-DD')
          : format(initDate, 'YYYY-MM-DD'),
        repeatEvery: {
          number: '1',
          period: 'week'
        },
        weekly: {
          // make sure we set a default start/end for any days which aren't given
          // explicit default values in props.initialValues.weekly
          ...difference(
            // for days not given explicit initial values in props,..
            [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday'
            ],
            keys(get(this.props.affiliate.schedule, 'weekly'))
            // ... provide them with default start/end ranges
          ).reduce((r, day) => ({ ...r, [day]: [{ start: '', end: '' }] }), {}),
          // and assume any days given explicit initial values should be selected
          selectedDays: mapValues(
            get(this.props.affiliate.schedule, 'weekly'),
            constant(true)
          ),
          // then merge back with the days given explicit initial values in props
          ...get(this.props.affiliate.schedule, 'weekly')
        },
        // shallow-merge the properties we didn't have special merge logic for
        ...omit(this.props.affiliate.schedule, ['start', 'end', 'weekly'])
      }
    }
  };

  handleOnSubmit = affiliate => {
    this.props.onSave(affiliate);
  };

  render() {
    const { onClose } = this.props;
    const { affiliate } = this.state;

    return (
      <Dialog
        open
        onClose={onClose}
        disableBackdropClick
        aria-labelledby="edit-affiliate-dialog"
        classes={{
          paper: styles.editAffiliateDialogPaper
        }}
      >
        <DialogTitle
          classes={{
            root: styles.dialogTitle
          }}
        >
          <div>{affiliate.name}</div>
          <div className={styles.dialogTitleActions}>
            <IconButton onClick={onClose} aria-label="Close">
              <Icon className="icon-close-exit" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent
          classes={{
            root: styles.dialogContent
          }}
        >
          <EditAffiliateForm
            initialValues={affiliate}
            onSubmit={this.handleOnSubmit}
            onCancel={onClose}
          />
        </DialogContent>
      </Dialog>
    );
  }
}
