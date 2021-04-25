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
  setMap,
  setTab,
  setSelectedFeatures,
  setFeatures,
  mapContainer,
  lng,
  lat,
  zoom,
  setLng,
  setLat,
  setZoom,
}) => {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: process.env.REACT_APP_MAPPBOX_STYLE,
      center: [lng, lat],
      zoom,
    });

    setMap(map);

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

      // Add an image to use as a custom marker
      map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
          if (error) throw error;
          map.addImage('custom-marker', image);
          // Add a GeoJSON source with 2 points
          map.addSource('points', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  // feature for point A
                  id: 111,
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [
                      24.9454,
                      60.1655,
                    ],
                  },
                  properties: {
                    title: 'Point A',
                  },
                },
                {
                  // feature for point B
                  id: 112,
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [
                      24.9554,
                      60.1755,
                    ],
                  },
                  properties: {
                    title: 'Point B',
                  },
                },
              ],
            },
          });

          // Add a symbol layer
          map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points',
            layout: {
              'icon-image': 'custom-marker',
              // get the title name from the source's "title" property
              'text-field': ['get', 'title'],
              'text-font': [
                'Open Sans Semibold',
                'Arial Unicode MS Bold',
              ],
              'text-offset': [0, 1.25],
              'text-anchor': 'top',
            },
            paint: {
              'text-color': 'white',
              'text-halo-blur': 0,
              'text-halo-width': 1,
              'text-halo-color': 'black',
            },
          });
        },
      );
    });

    const layerNames = [process.env.REACT_APP_MAPBOX_TILESET, 'points'];

    layerNames.forEach((layerName) => {
    // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', layerName, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', layerName, () => {
        map.getCanvas().style.cursor = '';
      });
    });

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: layerNames, // replace this with the name of the layer
      });

      if (!features.length) {
        return;
      }

      const feature = features[0];

      console.log(feature);

      const onClick = () => {
        setSelectedFeatures([feature]);
        setTab(1);
      };

      const content = document.createElement('div');
      ReactDOM.render(
        <div>
          <div>ID: {feature.id}</div>
          <Button onClick={onClick}>more</Button>
        </div>,
        content,
      );

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
  setMap, tab, setFeatures, setSelectedFeatures, setTab,
}) => {
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);

  const classes = useStyles();

  const mapContainer = useRef();

  setupMap({
    setMap,
    setTab,
    setSelectedFeatures,
    setFeatures,
    mapContainer,
    lng,
    lat,
    zoom,
    setLng,
    setLat,
    setZoom,
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
