import React, { useRef, useEffect, useState } from 'react';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import { Box, Container, Paper } from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Theme from '../Theme';

const useStyles = makeStyles({
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
    margin: '12px',
    borderRadius: '4px',
  },
});

const Map = () => {
  const classes = useStyles();

  const mapContainer = useRef();
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: 'mapbox://styles/kimmolepola/ckmxq3iyb123d17n26udep7h5',
      center: [lng, lat],
      zoom,
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', () => {
      console.log('mouse over');
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['safebike-tileset'], // replace this with the name of the layer
      });

      if (!features.length) {
        return;
      }

      const feature = features[0];

      const popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(`<h3>${feature.properties.type}</h3>`)
        .addTo(map);
    });

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    return () => map.remove();
  }, []);

  mapboxgl.workerClass = MapboxWorker;
  mapboxgl.accessToken = 'pk.eyJ1Ijoia2ltbW9sZXBvbGEiLCJhIjoiY2ttdWdsY2w3MTFrbTJvcDljcnc0dTdvbSJ9.Fqbb2Qe_1SRfNZrx4KaH7A';

  return (
    <Box className={classes.container}>
      <div className={classes.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className={clsx('map-container', classes.mapContainer)} ref={mapContainer} />
    </Box>
  );
};

const Cont = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>hello</div>
  );
};

export default Map;
