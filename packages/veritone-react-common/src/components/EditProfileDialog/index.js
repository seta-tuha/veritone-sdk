//import FullScreenDialog from 'components/FullScreenDialog';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Dialog from 'material-ui/Dialog';
import Grid from 'material-ui/Grid';

import List, { ListItem, ListItemText } from 'material-ui/List';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import CloseIcon from 'material-ui-icons/Close';
import Slide from 'material-ui/transitions/Slide';

import Avatar from 'components/Avatar';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';

import style from './styles.scss';

import PersonalInfo from './personalInfo';
import AccessInfo from './accessInfo';

const materialStyles = {
  appBar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  }
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class EditProfileDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: true };
  }

  renderEditProfileDialog() {
    return <div>hello world</div>;
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Button onClick={this.handleClickOpen}>Open full-screen dialog</Button>
        <Dialog
          fullScreen
          open={this.state.open}
          onClose={this.handleClose}
          transition={Transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton
                color="contrast"
                onClick={this.handleClose}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
              <Typography type="title" color="inherit" className={classes.flex}>
                My Account
              </Typography>
            </Toolbar>
          </AppBar>
          <List>
            <ListItem>
              <Grid
                container
                className={classes.root}
                alignItems="center"
                direction="row"
                justify="center"
              >
                <Grid item>
                  <Avatar src="http://placekitten.com/g/400/300" size={64} />
                </Grid>
                <Grid item xs={12}>
                  <Typography type="subheading" align="center" paragraph={true}>
                    Welcome, Unknown Soldier
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
            <ListItem style={ { paddingBottom: "36px" } }>
                <PersonalInfo firstName="Andrew" lastName={"Tung"} email="atung@veritone.com" />
            </ListItem>
            <ListItem>
                <AccessInfo lastChangedPasswordDate={ Date.now() } />
            </ListItem>
          </List>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(materialStyles)(EditProfileDialog);
