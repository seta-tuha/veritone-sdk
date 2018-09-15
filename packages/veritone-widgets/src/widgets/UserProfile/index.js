import React from 'react';
import { connect } from 'react-redux';
import { startCase, noop } from 'lodash';
import { string, func, bool, shape } from 'prop-types';
import { withProps } from 'recompose';
import {
  reduxForm,
  Form,
  reset as resetForm,
  submit as submitForm
} from 'redux-form';

import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

import { Avatar } from 'veritone-react-common';
import { modules } from 'veritone-redux-common';
const {
  user: { resetUserPassword, updateCurrentUserProfile, selectUser }
} = modules;
import widget from '../../shared/widget';
// import rootSaga from '../../redux/modules/userProfile/saga';
import PersonalInfoField from './PersonalInfoField';
import PasswordField from './PasswordField';
import ChangeNameModal from './Modals/ChangeName';
import ResetPasswordModal from './Modals/ResetPassword';

import styles from './styles.scss';

@connect(
  state => ({
    user: selectUser(state)
  }),
  {
    resetForm,
    submitForm,
    resetUserPassword,
    updateCurrentUserProfile
  }
)
@withProps(props => ({
  initialValues: {
    firstName: props.user.kvp.firstName,
    lastName: props.user.kvp.lastName,
    email: props.user.email
  }
}))
@reduxForm({
  form: 'userProfile',
  validate: values => {
    let errors = {};

    if (!values.firstName) {
      errors.firstName = 'Cannot be empty';
    }

    if (!values.lastName) {
      errors.lastName = 'Cannot be empty';
    }

    return errors;
  }
})
export class UserProfile extends React.Component {
  static propTypes = {
    user: shape({
      kvp: shape({
        firstName: string.isRequired,
        lastName: string.isRequired,
      }).isRequired,
      email: string
    }),
    imageUrl: string,
    passwordUpdatedDateTime: string,
    resetForm: func.isRequired,
    submitForm: func.isRequired,
    handleSubmit: func.isRequired,
    resetUserPassword: func.isRequired,
    updateCurrentUserProfile: func.isRequired,
    invalid: bool,
    pristine: bool
  };

  static defaultProps = {
    imageUrl: '//static.veritone.com/veritone-ui/default-avatar-2.png'
  };

  state = {
    currentModal: null
  };

  openChangeNameModal = () => {
    this.setState({
      currentModal: 'changeName'
    });
  };

  openChangeEmailModal = () => {
    this.setState({
      currentModal: 'changeEmail'
    });
  };

  openChangePasswordModal = () => {
    this.setState({
      currentModal: 'changePassword'
    });
  };

  closeModal = () => {
    this.setState({
      currentModal: null
    });
  };

  cancelChanges = () => {
    this.closeModal();
    this.props.resetForm();
  };

  submitChanges = () => {
    this.props.submitForm('userProfile');
  };

  handleResetPassword = () => {
    this.props
      .resetUserPassword()
      .catch(noop)
      .then(this.afterChange);
  };

  handleUpdateUser = vals => {
    this.props
      .updateCurrentUserProfile(vals)
      .catch(noop)
      .then(this.afterChange);
  };

  afterChange = () => {
    this.closeModal();
  };

  getUserFullName = () => {
    return startCase(
      `${this.props.user.kvp.firstName} ${this.props.user.kvp.lastName}`
    );
  };

  render() {
    return (
      <Form onSubmit={this.props.handleSubmit(this.handleUpdateUser)}>
        <div className={styles.container}>
          <div className={styles.column}>
            <div className={styles.section}>
              <Avatar
                src={this.props.imageUrl}
                label="Change"
                onClick={this.handleChangeAvatar}
              />

              <Typography variant="subheading" className={styles.greeting}>
                Welcome, {this.getUserFullName()}
              </Typography>
            </div>

            <div className={styles.section}>
              <Typography
                variant="title"
                gutterBottom
                classes={{ root: styles.title }}
              >
                Your Personal Info
              </Typography>
              <Typography
                variant="subheading"
                gutterBottom
                classes={{ root: styles.subheading }}
              >
                Manage this basic information - your name and email.
              </Typography>

              <PersonalInfoField
                name={this.getUserFullName()}
                email={this.props.user.email}
                onEditName={this.openChangeNameModal}
                onEditEmail={this.openChangeEmailModal}
              />
            </div>

            <div className={styles.section}>
              <Typography
                variant="title"
                gutterBottom
                classes={{ root: styles.title }}
              >
                Signing in to Veritone
              </Typography>
              <Typography
                variant="subheading"
                gutterBottom
                classes={{ root: styles.subheading }}
              >
                Control your password and account access.
              </Typography>

              <PasswordField
                lastUpdated={this.props.passwordUpdatedDateTime}
                onEdit={this.openChangePasswordModal}
              />
            </div>

            <ChangeNameModal
              open={this.state.currentModal === 'changeName'}
              onConfirm={this.submitChanges}
              onCancel={this.cancelChanges}
              disableConfirm={this.props.invalid || this.props.pristine}
            />

            <ResetPasswordModal
              open={this.state.currentModal === 'changePassword'}
              onConfirm={this.handleResetPassword}
              onCancel={this.cancelChanges}
            />
          </div>
        </div>
      </Form>
    );
  }
}

function SlideDown(props) {
  return <Slide direction="down" {...props} />;
}

class UserProfileDialog extends React.Component {
  static propTypes = {
    open: bool,
    title: string,
    onClose: func
  };

  static defaultProps = {
    onClose: noop
  };

  state = {
    openedByWidgetInstanceMethod: false
  };

  open = () => {
    this.setState({
      openedByWidgetInstanceMethod: true
    });
  };

  close = () => {
    this.setState({
      openedByWidgetInstanceMethod: false
    });
  };

  handleClose = () => {
    this.close();
    this.props.onClose();
  };

  render() {
    let { open, title, ...profileProps } = this.props;
    return (
      <Dialog
        fullScreen
        open={open || this.state.openedByWidgetInstanceMethod}
        TransitionComponent={SlideDown}
      >
        <AppBar position="fixed">
          <Toolbar>
            <IconButton color="inherit" onClick={this.handleClose}>
              <CloseIcon />
            </IconButton>
            <Typography variant="title" color="inherit">
              {title}
            </Typography>
          </Toolbar>
        </AppBar>

        <UserProfile {...profileProps} />
      </Dialog>
    );
  }
}

const UserProfileWidget = widget(UserProfileDialog);
export { UserProfileDialog as default, UserProfileWidget };
