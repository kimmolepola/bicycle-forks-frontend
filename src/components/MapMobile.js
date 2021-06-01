import React, {
  useRef, useEffect, useState,
} from 'react';
import {
  Box, Fab, Paper, IconButton, InputBase,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import './mapbox-gl-draw.css';
import { Search as SearchIcon, Add as AddIcon } from '@material-ui/icons';
import setupMap from './setupMap';

const useStyles = makeStyles((theme) => ({
  app: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
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
}));

const Map = ({
  setDrawMobile: setDraw,
  deleteFeature,
  handleSnackbarMessage,
  editFeature,
  getFeatures,
  addFeature,
  setMapMobile: setMap,
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
      point: false,
      polygon: false,
      trash: false,
    },
    navigation: true,
    geolocate: true,
    attribution: false,
    scale: true,
    fullScreen: true,
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
    <div className={classes.app}>
      <Box className={classes.container}>
        <div className={clsx('map-container', classes.mapContainer)} style={{ display: '' }} ref={mapContainer} />
        <Fab onClick={handleFabClick} style={{ position: 'absolute', bottom: 50, right: 30 }} color="primary" aria-label="add">
          <AddIcon />
        </Fab>
      </Box>
    </div>
  );
};

export default Map;
