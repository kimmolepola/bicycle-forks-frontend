import React, {
  useRef, useEffect, useState,
} from 'react';
import {
  Box,
  Fab,
  Paper,
  IconButton,
  InputBase,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import './mapbox-gl-draw.css';
import { Add as AddIcon } from '@material-ui/icons';
import setupMap from './setupMap';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './mapbox-gl-geocoder.css';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    position: 'relative',
    background: 'green',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sidebar: {
    position: 'absolute',
    backgroundColor: 'rgba(35, 55, 75, 0.9)',
    color: '#ffffff',
    padding: '6px 12px',
    font: '15px/24px monospace',
    zIndex: 1,
    top: 0,
    left: 0,
    borderRadius: '4px',
    margin: '12px',
  },
}));

const Map = ({
  deleteFeature,
  handleSnackbarMessage,
  editFeature,
  setDraw,
  getFeatures,
  addFeature,
  setMap,
  tab,
}) => {
  const classes = useStyles();
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);
  const [currentPopup, setCurrentPopup] = useState(null);

  const mapContainer = useRef();

  useEffect(() => {
    const doit = () => {
      if (currentPopup) {
        currentPopup.setLngLat(currentPopup.getLngLat());
      }
    };
    doit();
  }, [currentPopup]);

  const controls = {
    draw: {
      point: true,
      polygon: true,
      trash: true,
    },
    navigation: true,
    geolocate: true,
    attribution: true,
    scale: true,
    fullScreen: false,
  };

  useEffect(() => {
    setupMap({
      controls,
      deleteFeature,
      handleSnackbarMessage,
      editFeature,
      setCurrentPopup,
      setDraw,
      getFeatures,
      addFeature,
      setMap,
      mapContainer,
      lng,
      lat,
      zoom,
      setLng,
      setLat,
      setZoom,
    });
  }, []);

  const handleFabClick = (e) => {
    e.preventDefault();
    const elements = [...document.getElementsByClassName('mapboxgl-ctrl-top-right')];
    for (let i = 0; i < elements.length; i += 1) {
      if (elements[i].style.visibility === 'visible') {
        elements[i].style.visibility = 'hidden';
      } else {
        elements[i].style.visibility = 'visible';
      }
    }
  };

  return (
    <Box id="mapTabContent" style={{ display: tab === 0 ? '' : 'none' }} className={classes.container}>
      <div
        className={classes.sidebar}
      >
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className={clsx('map-container', classes.mapContainer)} ref={mapContainer} />
      <Fab onClick={handleFabClick} style={{ position: 'absolute', bottom: 50, right: 30 }} color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Map;
