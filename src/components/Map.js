import React, { useRef, useEffect, useState } from 'react';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import {
  Box, Container, Paper, Button, Link,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ReactDOM from 'react-dom';
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

const setupMap = ({
  setFeatures, mapContainer, lng, lat, zoom, setLng, setLat, setZoom,
}) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: process.env.REACT_APP_MAPPBOX_STYLE,
      center: [lng, lat],
      zoom,
    });

    map.on('load', () => {
      const fetchFeatures = async () => {
        try {
          const layer = await map.getLayer(process.env.REACT_APP_MAPBOX_TILESET);
          if (layer && layer.source) {
            const features = await map.querySourceFeatures(
              layer.source,
              { sourceLayer: process.env.REACT_APP_MAPBOX_TILESET },
            );
            setFeatures(features);
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchFeatures();
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', process.env.REACT_APP_MAPBOX_TILESET, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', process.env.REACT_APP_MAPBOX_TILESET, () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [process.env.REACT_APP_MAPBOX_TILESET], // replace this with the name of the layer
      });

      if (!features.length) {
        return;
      }

      const feature = features[0];

      const content = document.createElement('div');
      ReactDOM.render(<div>ID: {feature.id}</div>, content);

      const popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        // .setHTML(`<h3>${feature.properties.type}</h3>`)
        .setDOMContent(content)
        .addTo(map);
    });

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    return () => {
      map.remove();
    };
  }, []);
};

const Map = ({
  tab, setFeatures,
}) => {
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);

  const classes = useStyles();

  const mapContainer = useRef();

  setupMap({
    setFeatures, mapContainer, lng, lat, zoom, setLng, setLat, setZoom,
  });

  mapboxgl.workerClass = MapboxWorker;
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_ACCESSTOKEN;

  return (
    <Box style={{ display: tab === 0 ? '' : 'none' }} className={classes.container}>
      <div className={classes.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className={clsx('map-container', classes.mapContainer)} ref={mapContainer} />
    </Box>
  );
};

export default Map;
