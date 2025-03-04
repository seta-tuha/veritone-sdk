import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { formComponents } from 'veritone-react-common';
import { func, shape, number, bool } from 'prop-types';

import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';

import styles from './styles.scss';

const SubtitleConfigForm = reduxForm({
  form: 'subtitleConfig',
  initialValues: {}
})(({ handleSubmit, onCancel, children, submitting, invalid }) => (
  <form onSubmit={handleSubmit} data-veritone-component="subtitle-config-form">
    <div className={styles.subtitleConfigField}>
      <FormControl fullWidth>
        <Grid container spacing={16} alignItems="flex-end">
          <Grid item className={styles.subtitleFieldLabel}>
            Max Characters per Caption Line
          </Grid>
          <Grid item>
            <Field
              type="number"
              name="maxCharacterPerLine"
              style={{ width: 50 }}
              component={formComponents.TextField}
              // eslint-disable-next-line
              normalize={value => parseInt(value)}
              InputLabelProps={{
                classes: {
                  root: styles.subtitleFieldLabel,
                  shrink: styles.subtitleFieldLabelShrink
                }
              }}
              InputProps={{
                classes: {
                  input: styles.subtitleFieldInput
                }
              }}
              data-veritone-element="max-characters-per-line-input"
            />
          </Grid>
        </Grid>
      </FormControl>
    </div>
    <div className={styles.subtitleConfigField}>
      <FormControl fullWidth>
        <Grid container spacing={16} alignItems="flex-end">
          <Grid item className={styles.subtitleFieldLabel}>
            Number of Lines per Screen
          </Grid>
          <Grid item>
            <Field
              component={formComponents.Select}
              name="linesPerScreen"
              style={{ width: 50 }}
              classes={{
                select: styles.subtitleFieldInput
              }}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                },
                getContentAnchorEl: null
              }}
              data-veritone-element="lines-per-screen-select"
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Field>
          </Grid>
        </Grid>
      </FormControl>
    </div>
    <div className={styles.subtitleConfigField}>
      <Field
        component={formComponents.Switch}
        color="primary"
        name="newLineOnPunctuation"
        label="New Caption Line on Punctuation"
        data-veritone-element="new-line-on-punctuation-switch"
      />
    </div>
    <br />
    <DialogActions>
      <Button
        onClick={onCancel}
        data-veritone-element="subtitle-config-form-cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        color="primary"
        disabled={submitting || invalid}
        data-veritone-element="subtitle-config-form-save-button"
      >
        Save
      </Button>
    </DialogActions>
  </form>
));

SubtitleConfigForm.propTypes = {
  handleCancel: func,
  initialValues: shape({
    linesPerScreen: number,
    maxLinesPerCaptionLine: number,
    newLineOnPunctuation: bool
  }),
  onSubmit: func
};

export default SubtitleConfigForm;
