import React, { useState, useEffect } from 'react';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import {
  CssBaseline, Snackbar, Slide,
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
import MapMobile from './components/MapMobile';

const drawerWidth = 256;

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
    padding: Theme.spacing(4),
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

export const DELETE_FEATURE = gql`mutation ($id: ID!){
  deleteFeature(
    id: $id
  )
}`;

const EDIT_FEATURE = gql`mutation ($id: ID!, $title: String!, $type: String, $geometryType: String!, $coordinates: [[Float!]!]!){
  editFeature(
    id: $id
    title: $title
    type: $type
    geometryType: $geometryType
    coordinates: $coordinates    
  )
}`;

const ADD_FEATURE = gql`mutation ($id: ID!, $title: String!, $type: String, $geometryType: String!, $coordinates: [[Float!]!]!){
  addFeature(
    id: $id
    title: $title
    type: $type
    geometryType: $geometryType
    coordinates: $coordinates    
  )
}`;

const ALL_FEATURES = gql`query{allFeatures{id, title, type, geometryType, coordinates}}`;

const App = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [map, setMap] = useState(null);
  const [mapMobile, setMapMobile] = useState(null);
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [navigation, setNavigation] = useState('App');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarTransition] = useState(() => function slide(props) { return <Slide {...props} direction="left" />; });
  const [snackbarMessage, setSnackbarMessage] = useState({ message: '', severity: 'info' });
  const [draw, setDraw] = useState(null);
  const [drawMobile, setDrawMobile] = useState(null);

  const classes = useStyles();

  const handleSnackbarMessage = ({ severity, message }) => {
    setSnackbarMessage({ severity, message });
    setSnackbarOpen(true);
  };

  const handleError = (error) => {
    handleSnackbarMessage({ severity: 'error', message: error.message });
    console.error(error);
  };

  const [deleteFeature] = useMutation(DELETE_FEATURE, {
    onError: handleError,
    refetchQueries: [{ query: ALL_FEATURES, notifyOnNetworkStatusChange: true }],
  });

  const [editFeature] = useMutation(EDIT_FEATURE, {
    onError: handleError,
    refetchQueries: [{ query: ALL_FEATURES, notifyOnNetworkStatusChange: true }],
  });

  const [addFeature] = useMutation(ADD_FEATURE, {
    onError: handleError,
    refetchQueries: [{ query: ALL_FEATURES, notifyOnNetworkStatusChange: true }],
  });

  const [getFeatures, { loading, data: featuresLazyQueryData }] = useLazyQuery(ALL_FEATURES, { fetchPolicy: 'network-only' });

  const {
    loading: featuresLoading,
    error: featuresError,
    data: featuresData,
  } = useQuery(ALL_FEATURES, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (map) {
      map.resize();
    }
    if (mapMobile) {
      mapMobile.resize();
    }
  }, [map, mapMobile, width, drawerOpen]);

  useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
    return () => {
      window.removeEventListener('resize', () => setWidth(window.innerWidth));
    };
  }, []);

  const isMobile = width <= 768;

  useEffect(() => {
    const doit = () => {
      if (map && draw && featuresData && mapMobile && drawMobile) {
        const featuresFromDB = {
          type: 'FeatureCollection',
          features: featuresData.allFeatures.map((x) => (
            {
              id: x.id,
              type: 'Feature',
              geometry: {
                type: x.geometryType,
                coordinates: x.geometryType === 'Point' ? x.coordinates[0] : [[...x.coordinates, x.coordinates[0]]],
              },
              properties: {
                title: x.title,
                type: x.type,
              },
            })),
        };
        draw.set(featuresFromDB);
        drawMobile.set(featuresFromDB);
        map.getSource('labels').setData(featuresFromDB);
        mapMobile.getSource('labels').setData(featuresFromDB);
      }
    };
    doit();
  }, [featuresData, draw, map, mapMobile, drawMobile]);

  return (
    <ThemeProvider theme={Theme}>
      <div className={classes.root} style={{ display: isMobile ? 'none' : 'flex' }}>
        <CssBaseline />
        <Snackbar TransitionComponent={snackbarTransition} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={snackbarOpen} autoHideDuration={5000}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.severity}>
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
        <nav id="drawer" style={{ display: drawerOpen ? '' : 'none' }} className={classes.drawer}>
          <Navigator
            PaperProps={{ style: { width: drawerWidth } }}
            navigation={navigation}
            setNavigation={setNavigation}
            setDrawerOpen={setDrawerOpen}
          />
        </nav>
        <div className={classes.app}>
          <Header
            tab={tab}
            setTab={setTab}
            className={classes.header}
            setDrawerOpen={setDrawerOpen}
            drawerOpen={drawerOpen}
          />
          <main className={classes.main}>
            <Map
              map={map}
              deleteFeature={deleteFeature}
              handleSnackbarMessage={handleSnackbarMessage}
              editFeature={editFeature}
              setDraw={setDraw}
              getFeatures={getFeatures}
              addFeature={addFeature}
              setMap={setMap}
              tab={tab}
            />
            <div id="pointTabContent" style={{ display: tab === 1 ? 'flex' : 'none' }}>Lorem ipsum</div>
          </main>
        </div>
      </div>
      <div
        id="mobileMap"
        style={{
          display: isMobile ? 'flex' : 'none',
          flex: 1,
          position: 'fixed',
          width: '100%',
          height: '100%',
        }}
      >
        <CssBaseline />
        <MapMobile
          map={mapMobile}
          getFeatures={getFeatures}
          setMapMobile={setMapMobile}
          setDrawMobile={setDrawMobile}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
