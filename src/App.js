import React, { useState, useEffect } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import {
  CssBaseline, Hidden, Typography, Link, Snackbar, Slide,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  useMutation, useQuery, gql,
  useLazyQuery,
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

const ADD_FILL = gql`mutation ($id: ID!, $title: String!, $category: String, $type: String, $coordinates: [[Float!]!]!){
  addFill(
    id: $id
    title: $title
    category: $category
    type: $type
    coordinates: $coordinates    
  )
}`;

const ALL_FILLS = gql`query{allFills{id, title, category, type, coordinates}}`;

const DELETE_POINT = gql`mutation ($id: ID!){
  deletePoint(
    id: $id
  )
}`;

const EDIT_POINT = gql`mutation ($id: ID!, $title: String, $category: String, $type: String, $groupID: String, $lng: Float!, $lat: Float!){
  editPoint(
    id: $id
    title: $title
    category: $category
    type: $type
    groupID: $groupID
    lng: $lng
    lat: $lat
  )
}`;

const ADD_POINT = gql`mutation ($title: String!, $category: String, $type: String, $groupID: String, $lng: Float!, $lat: Float!){
  addPoint(
    title: $title
    category: $category
    type: $type
    groupID: $groupID
    lng: $lng
    lat: $lat
  ) 
}`;

const ALL_POINTS = gql`query{allPoints{id, mapboxFeatureID, title, category, type, groupID, lng, lat}}`;

const App = () => {
  const [map, setMap] = useState(null);
  const [tab, setTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [features, setFeatures] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [navigation, setNavigation] = useState('App');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarTransition] = useState(() => function slide(props) { return <Slide {...props} direction="left" />; });
  const [snackbarMessage, setSnackbarMessage] = useState({ message: '', severity: 'info' });
  const [draw, setDraw] = useState(null);

  const classes = useStyles();

  const handleSnackbarMessage = ({ severity, message }) => {
    setSnackbarMessage({ severity, message });
    setSnackbarOpen(true);
  };

  const handleError = (error) => {
    handleSnackbarMessage({ severity: 'error', message: error.message });
    console.error(error);
  };

  const [getFills, { loading, data: fillsLazyQueryData }] = useLazyQuery(ALL_FILLS, { fetchPolicy: 'network-only' });

  const [addFill] = useMutation(ADD_FILL, {
    onError: handleError,
    refetchQueries: [{ query: ALL_FILLS, notifyOnNetworkStatusChange: true }],
  });

  const {
    loading: fillsLoading,
    error: fillsError,
    data: fillsData,
  } = useQuery(ALL_FILLS, { fetchPolicy: 'network-only' });

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

  /*
  useEffect(() => {
    const doit = () => {
      if (draw && fillsData) {
        console.log(fillsData);
      }
    };
    doit();
  }, [fillsData]);
*/

  useEffect(() => {
    const doit = () => {
      console.log('fillsData: ', fillsData);
      if (draw && fillsData) {
        // const source = map.getSource('mapbox-gl-draw-cold');
        // if (source) {
        const fills = {
          type: 'FeatureCollection',
          features: fillsData.allFills.map((x) => (
            {
              id: x.id,
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [x.coordinates],
              },
              properties: {
                title: x.title,
              },
            })),
        };
        console.log('fills draw set: ', fills);
        draw.set(fills);
        // map.getSource(source).setData(fills);
        // }
      }
    };
    doit();
  }, [fillsData, draw]);

  /*
                active: 'true',
                id: x.id,
                meta: 'feature',
                'meta:type': 'Polygon',
                mode: 'simple_select',
*/

  useEffect(() => {
    /*
    const doIt = () => {
      if (map && pointsData) {
        const source = map.getSource('points');
        if (source) {
          const points = {
            type: 'FeatureCollection',
            features: pointsData.allPoints.map((x) => (
              {
                id: x.mapboxFeatureID,
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [x.lng, x.lat],
                    [x.lng + 0.01, x.lat],
                    [x.lng, x.lat + 0.01],
                  ],
                },
                properties: {
                  databaseID: x.id,
                  title: x.title,
                  category: x.category,
                  type: x.type,
                  groupID: x.groupID,
                },
              })),
          };
          map.getSource('points').setData(points);
          setFeatures(points.features);
          console.log('set features: ', points.features);
        }
      }
    };
    doIt();
    */
  }, [map, pointsData]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={Theme}>
      <div className={classes.root}>
        <CssBaseline />
        <Snackbar TransitionComponent={snackbarTransition} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={5000}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.severity}>
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
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
              setDraw={setDraw}
              getFills={getFills}
              addFill={addFill}
              map={map}
              handleSnackbarMessage={handleSnackbarMessage}
              addPoint={addPoint}
              navigation={navigation}
              setMap={setMap}
              tab={tab}
              setTab={setTab}
              setFeatures={setFeatures}
              setSelectedFeatures={setSelectedFeatures}
            />
            <Points
              handleSnackbarMessage={handleSnackbarMessage}
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
