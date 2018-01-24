import React from 'react';
import Grid from 'material-ui/Grid';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import format from 'date-fns/format';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';

const formatDate = date => {
  return format(date, 'MMMM D, YYYY');
};

const AccessInfo = ({ lastChangedPasswordDate }) => (
  <Grid lg={12} container justify="center"  direction="row">
  <Grid item md={12} sm={12} lg={12}>
    <Typography type="title" align="center" paragraph={true}>
      Signing into Veritone
    </Typography>
    <Typography type="caption" align="center">
      Control your password and account access
    </Typography>
  </Grid>
  <Grid item xs={12} sm={8} md={7} lg={5}>
    <Paper>
      <List>
        <ListItem>
          <Grid container alignItems="" direction="row" justify="">
            <Grid item xs={2}>
              <Typography type="body2">Password</Typography>
            </Grid>
            <Grid item xs={8} align="center">
            <Typography type="caption">Last changed: { formatDate(lastChangedPasswordDate) }</Typography>
            </Grid>
            <Grid item xs={2} align="right">
              <KeyboardArrowRight />
            </Grid>
          </Grid>
        </ListItem>
      </List>
    </Paper>
  </Grid>
</Grid>
);

/*
  <Grid item xs={12}>
    <Typography type="title" align="center" paragraph={true}>
      Signing into Veritone
    </Typography>
    <Typography type="caption" align="center" paragraph={true}>
      Control your password and account access
    </Typography>



    <Paper xs={6}>
      <List>
        <ListItem>
          <Grid container alignItems="center" direction="row" justify="center">
            <Grid item xs={4}>
              <Typography type="body2">Password</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography type="caption">Last changed: { formatDate(lastChangedPasswordDate) }</Typography>
            </Grid>
            <Grid item xs={2} align="right">
              Action
            </Grid>
          </Grid>
        </ListItem>
      </List>
    </Paper>
  </Grid>
);
*/
export default AccessInfo;
