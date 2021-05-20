import React, {
  useRef, useEffect, useState,
} from 'react';
import ReactDOM from 'react-dom';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import {
  Box, Button,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import defaultMapboxDrawStyles from '@mapbox/mapbox-gl-draw/src/lib/theme';
import './mapbox-gl-draw.css';

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
    margin: '12px',
    borderRadius: '4px',
  },
  featureForm: {
    position: 'absolute',
    backgroundColor: 'rgba(35, 55, 75, 0.9)',
    color: '#ffffff',
    padding: '6px 12px',
    font: '15px/24px monospace',
    zIndex: 1,
    bottom: 0,
    margin: '100px',
    borderRadius: '4px',
  },
}));

const setupMap = ({
  setCurrentFeature,
  setDraw,
  getFills,
  addFill,
  setMap,
  mapContainer,
  lng,
  lat,
  zoom,
  setLng,
  setLat,
  setZoom,
}) => {
  mapboxgl.workerClass = MapboxWorker;
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_ACCESSTOKEN;

  const map = new mapboxgl.Map({
    attributionControl: false,
    container: mapContainer.current,
    style: process.env.REACT_APP_MAPPBOX_STYLE,
    center: [lng, lat],
    zoom,
  });

  const draw = new MapboxDraw({
    userProperties: true,
    displayControlsDefault: false,
    controls: {
      point: true,
      polygon: true,
      trash: true,
    },
    styles: defaultMapboxDrawStyles.map((x) => {
      switch (x.id) {
        case 'gl-draw-polygon-fill-inactive':
          return { ...x, paint: { ...x.paint, 'fill-opacity': 0.5, 'fill-color': '#0080ff' } };
        case 'gl-draw-polygon-stroke-inactive':
          return { ...x, filter: ['all', false] };
        default:
          return x;
      }
    }),
  });

  map.on('draw.create', (x) => {
    console.log('create: ', x);
    addFill({ variables: { id: x.features[0].id, title: `title_${x.features[0].id}`, coordinates: x.features[0].geometry.coordinates[0] } });

    const displayPopup = () => {
      const content = document.createElement('div');

      const onClick = () => {
        console.log('popup button click');
      };

      ReactDOM.render(
        <div>
          <div>Popup</div>
          <Button style={{ marginTop: 5 }} color="primary" variant="contained" onClick={onClick}>more</Button>
        </div>,
        content,
      );

      const coors = x.features[0].geometry.coordinates.length === 2
        ? x.features[0].geometry.coordinates
        : x.features[0].geometry.coordinates[0][0];

      const popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(coors)
        .setDOMContent(content)
        .addTo(map);
    };
    displayPopup();
  });
  map.on('draw.delete', (x) => console.log('delete: ', x));
  map.on('draw.update', (x) => console.log('update: ', x));

  map.on('load', () => {
    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    }));
    map.addControl(new mapboxgl.AttributionControl({
      compact: true,
    }));
    const scale = new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'imperial',
    });
    map.addControl(scale);
    scale.setUnit('metric');

    getFills();
    setDraw(draw);
    setMap(map);
  });

  map.on('move', () => {
    setLng(map.getCenter().lng.toFixed(4));
    setLat(map.getCenter().lat.toFixed(4));
    setZoom(map.getZoom().toFixed(2));
  });

  return () => {
    map.remove();
  };
};

const Map = ({
  draw, setDraw, getFills, addFill, map, setMap, tab,
}) => {
  const classes = useStyles();
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);
  const [currentFeature, setCurrentFeature] = useState(null);

  const mapContainer = useRef();

  if (map) {
    console.log(map.getStyle());
  }

  useEffect(() => {
    const doit = () => {
      if (map && currentFeature) { //eslint-disable-line
        console.log('poopup ');
        const content = document.createElement('div');

        const onClick = () => {
          console.log('popup button click');
        };

        ReactDOM.render(
          <div>
            <div>Popup</div>
            <Button style={{ marginTop: 5 }} color="primary" variant="contained" onClick={onClick}>more</Button>
          </div>,
          content,
        );

        /*
        const coors = currentFeature.features[0].geometry.coordinates.length === 2
          ? currentFeature.features[0].geometry.coordinates
          : currentFeature.features[0].geometry.coordinates[0][0];

        console.log('coors: ', coors);
*/

        const popup = new mapboxgl.Popup()
          .setLngLat([lng, lat])
          .setDOMContent(content)
          .addTo(map);
      }
    };
    doit();
  }, [map, currentFeature]);

  useEffect(() => {
    const doit = () => {
      if (draw) {
        document.querySelector('.mapbox-gl-draw_ctrl-draw-btn.mapbox-gl-draw_polygon')
          .addEventListener('mousedown', () => {
            console.log('polygon button click');
          });
      }
    };
    doit();
  }, [draw]);

  useEffect(() => {
    setupMap({
      setCurrentFeature,
      setDraw,
      getFills,
      addFill,
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

  return (
    <Box style={{ display: tab === 0 ? '' : 'none' }} className={classes.container}>
      <div className={classes.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className={classes.featureForm}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className={clsx('map-container', classes.mapContainer)} ref={mapContainer} />
    </Box>
  );
};

export default Map;
