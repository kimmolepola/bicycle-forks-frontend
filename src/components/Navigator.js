import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@material-ui/core';
import {
  DirectionsBike as DirectionsBikeIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  DnsRounded as DnsRoundedIcon,
  PermMediaOutlined as PermMediaOutlinedIcon,
  Public as PublicIcon,
  SettingsEthernet as SettingsEthernetIcon,
  SettingsInputComponent as SettingsInputComponentIcon,
  Timer as TimerIcon,
  Settings as SettingsIcon,
  PhonelinkSetup as PhonelinkSetupIcon,
  Close as CloseIcon,
} from '@material-ui/icons';
import Theme from '../Theme';

const useStyles = makeStyles({
  categoryHeader: {
    paddingTop: Theme.spacing(2),
    paddingBottom: Theme.spacing(2),
  },
  categoryHeaderPrimary: {
    color: Theme.palette.common.white,
  },
  item: {
    paddingTop: 1,
    paddingBottom: 1,
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover,&:focus': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  itemCategory: {
    backgroundColor: '#232f3e',
    boxShadow: '0 -1px 0 #404854 inset',
    paddingTop: Theme.spacing(2),
    paddingBottom: Theme.spacing(2),
  },
  firebase: {
    fontSize: 24,
    color: Theme.palette.common.white,
  },
  itemActiveItem: {
    color: '#4fc3f7',
  },
  itemPrimary: {
    fontSize: 'inherit',
  },
  itemIcon: {
    minWidth: 'auto',
    marginRight: Theme.spacing(2),
  },
  divider: {
    marginTop: Theme.spacing(2),
  },
});

const Navigator = ({
  setDrawerOpen, navigation, setNavigation, ...other
}) => {
  const classes = useStyles();

  const categories = [
    {
      id: 'Admin',
      children: [
        { id: 'App', icon: <DirectionsBikeIcon /> }],
    },
  ];

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem className={clsx(classes.firebase, classes.item, classes.itemCategory)}>
          Safebike
          <Button id="drawerCloseButton" color="inherit" style={{ position: 'absolute', right: 0 }} onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </Button>
        </ListItem>
        {categories.map(({ id, children }) => (
          <React.Fragment key={id}>
            <ListItem className={classes.categoryHeader}>
              <ListItemText
                classes={{
                  primary: classes.categoryHeaderPrimary,
                }}
              >
                {id}
              </ListItemText>
            </ListItem>
            {children.map(({ id: childId, icon }) => (
              <ListItem
                key={childId}
                button
                className={clsx(classes.item, childId === navigation && classes.itemActiveItem)}
                onClick={() => setNavigation(childId)}
              >
                <ListItemIcon className={classes.itemIcon}>{icon}</ListItemIcon>
                <ListItemText
                  classes={{
                    primary: classes.itemPrimary,
                  }}
                >
                  {childId}
                </ListItemText>
              </ListItem>
            ))}

            <Divider className={classes.divider} />
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Navigator;
