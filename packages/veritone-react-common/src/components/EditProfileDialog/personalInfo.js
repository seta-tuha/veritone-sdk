import React from 'react';
import Grid from 'material-ui/Grid';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import ModeEdit from 'material-ui-icons/ModeEdit';

const PersonalInfo = ({ firstName, lastName, email }) => (
  <Grid lg={12} container justify="center"  direction="row">
    <Grid item md={12} sm={12} lg={12}>
      <Typography type="title" align="center" paragraph={true}>
        Your Personal Info
      </Typography>
      <Typography type="caption" align="center">
        Manage this basic information - your name and email
      </Typography>
    </Grid>
    <Grid item xs={12} sm={8} md={7} lg={5}>
      <Paper>
        <List>
          <ListItem>
            <Grid container alignItems="" direction="row" justify="">
              <Grid item xs={2} align="left">
                <Typography type="body2">Name</Typography>
              </Grid>
              <Grid item xs={8} align="center">
                <Typography type="caption">{ firstName } { lastName }</Typography>
              </Grid>
              <Grid item xs={2} align="right">
                <ModeEdit color="#eee"/>
              </Grid>
            </Grid>
          </ListItem>
          <Divider light />
          <ListItem>
            <Grid container alignItems="" direction="row" justify="">
              <Grid item xs={2}>
                <Typography type="body2">Email</Typography>
              </Grid>
              <Grid item xs={8} align="center">
                <Typography type="caption">
                  { email }
                </Typography>
              </Grid>
              <Grid item xs={2} align="right">

              </Grid>
            </Grid>
          </ListItem>
        </List>
      </Paper>
    </Grid>
  </Grid>
);

export default PersonalInfo;
