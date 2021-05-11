import React, { useState, useEffect } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import {
  CssBaseline, Hidden, Typography, Link,
} from '@material-ui/core';
import {
  useMutation, useQuery, gql,
} from '@apollo/client';
import Navigator from './components/Navigator';
import Map from './components/Map';
import Header from './components/Header';
import Theme from './Theme';
import Points from './components/Points';

const drawerWidth = 256;

const Copyright = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {'Copyright © '}
    <Link color="inherit" href="https://material-ui.com/">
      Your Website
    </Link>{' '}
    {new Date().getFullYear()}
    {'.'}
  </Typography>
);

const useStyles = makeStyles({
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  drawer: {
    [Theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  app: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    display: 'flex',
    flex: 1,
    paddingTop: Theme.spacing(6),
    paddingLeft: Theme.spacing(4),
    paddingRight: Theme.spacing(4),
    background: '#eaeff1',
  },
  footer: {
    padding: Theme.spacing(2),
    background: '#eaeff1',
  },
  header: {
    flex: 1,
  },
});

const DELETE_POINT = gql`mutation ($id: ID!){
  deletePoint(
    id: $id
  )
}`;

const EDIT_POINT = gql`mutation ($id: ID!, $title: String, $category: String, $type: String, $groupid: String, $lng: Float, $lat: Float){
  editPoint(
    id: $id
    title: $title
    category: $category
    type: $type
    groupid: $groupid
    lng: $lng
    lat: $lat
  )
}`;

const ADD_POINT = gql`mutation ($point: String!){
  addPoint(
    point: $point
  ) 
}`;
const ALL_POINTS = gql`query{allPoints}`;

const handleError = (error) => {
  console.error(error);
};

const App = () => {
  const [map, setMap] = useState(null);
  const [tab, setTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [features, setFeatures] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [navigation, setNavigation] = useState('App');

  const classes = useStyles();
  const [deletePoint] = useMutation(DELETE_POINT, {
    onError: handleError,
    refetchQueries: [{ query: ALL_POINTS, notifyOnNetworkStatusChange: true }],
  });

  const [editPoint] = useMutation(EDIT_POINT, {
    onError: handleError,
    refetchQueries: [{ query: ALL_POINTS, notifyOnNetworkStatusChange: true }],
  });

  const [addPoint] = useMutation(ADD_POINT, {
    onError: handleError,
    refetchQueries: [{ query: ALL_POINTS, notifyOnNetworkStatusChange: true }],
  });

  const {
    loading: pointsLoading,
    error: pointsError,
    data: pointsData,
  } = useQuery(ALL_POINTS, { fetchPolicy: 'network-only' });

  useEffect(() => {
    const doIt = () => {
      if (map && pointsData) {
        const source = map.getSource('points');
        if (source) {
          const featuresData = JSON.parse(pointsData.allPoints).data;
          map.getSource('points').setData(featuresData);
          setFeatures(featuresData.features);
        }
      }
    };
    doIt();
  }, [map, pointsData]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={Theme}>
      <div className={classes.root}>
        <CssBaseline />
        <nav className={classes.drawer}>
          <Hidden smUp implementation="js">
            <Navigator
              PaperProps={{ style: { width: drawerWidth } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              navigation={navigation}
              setNavigation={setNavigation}
            />
          </Hidden>
          <Hidden xsDown implementation="css">
            <Navigator
              PaperProps={{ style: { width: drawerWidth } }}
              navigation={navigation}
              setNavigation={setNavigation}
            />
          </Hidden>
        </nav>
        <div className={classes.app}>
          <Header
            tab={tab}
            setTab={setTab}
            className={classes.header}
            onDrawerToggle={handleDrawerToggle}
          />
          <main className={classes.main}>
            <Map
              addPoint={addPoint}
              navigation={navigation}
              setMap={setMap}
              tab={tab}
              setTab={setTab}
              setFeatures={setFeatures}
              setSelectedFeatures={setSelectedFeatures}
            />
            <Points
              deletePoint={deletePoint}
              editPoint={editPoint}
              tab={tab}
              features={features}
              selectedFeatures={selectedFeatures}
              setSelectedFeatures={setSelectedFeatures}
            />
          </main>
          <footer className={classes.footer}>
            <Copyright />
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
