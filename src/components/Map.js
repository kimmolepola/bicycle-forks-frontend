import React, { useRef, useEffect, useState } from 'react';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import {
  Box, Container, Paper, Button, Link, FormControlLabel, Switch, TextField,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ReactDOM from 'react-dom';
import { useQuery, gql } from '@apollo/client';
import Theme from '../Theme';

const ALL_POINTS = gql`query{allPoints}`;

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
}));

const naviEditHandleClick = ({
  map, e, mapContainer, pointsSource, setPointsSource,
}) => {
  console.log(e);

  console.log('mapContainer: ', mapContainer);

  const inputTitle = React.createRef();
  const inputType = React.createRef();
  const inputGroupID = React.createRef();
  const inputCategory = React.createRef();
  const inputLng = React.createRef();
  const inputLat = React.createRef();

  const content = document.createElement('div');

  const styleFormField = { marginTop: 10 };

  const popup = new mapboxgl.Popup()
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    // .setHTML(`<h3>${feature.properties.type}</h3>`)
    .setDOMContent(content)
    .addTo(map);

  const onSubmit = (ev) => {
    ev.preventDefault();
    console.log(map.getSource('points'));
    const newPoint = {
      // feature for point A
      id: pointsSource.data.previousFeatureId + 1,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          inputLng.current.value,
          inputLat.current.value,
        ],
      },
      properties: {
        title: inputTitle.current.value,
        type: inputType.current.value,
        category: inputCategory.current.value,
        groupID: inputGroupID.current.value,
      },
    };
    const newPointsSource = { ...pointsSource };
    newPointsSource.data.previousFeatureId = newPoint.id;
    newPointsSource.data.features.push(newPoint);
    setPointsSource(newPointsSource);
    console.log(newPointsSource);
    const setData = async () => {
      await map.getSource('points').setData(newPointsSource.data);
      popup.remove();
    };
    setData();
  };

  ReactDOM.render(
    <div style={{ maxHeight: mapContainer.current.clientHeight / 2, overflowY: 'auto' }}>
      <div>Add a point</div>
      <form onSubmit={onSubmit} noValidate autoComplete="off">
        <TextField style={styleFormField} size="small" inputRef={inputTitle} placeholder="e.g. Point A" id="outlined-basic" label="Title" />
        <TextField style={styleFormField} size="small" inputRef={inputType} placeholder="e.g. line" id="outlined-basic" label="Type" />
        <TextField style={styleFormField} size="small" inputRef={inputGroupID} placeholder="" id="outlined-basic" label="GroupID" />
        <TextField style={styleFormField} size="small" inputRef={inputCategory} placeholder="e.g. u-rack" id="outlined-basic" label="Category" />
        <TextField style={styleFormField} defaultValue={e.lngLat.lng} size="small" inputRef={inputLng} id="outlined-basic" label="Longitude" />
        <TextField style={styleFormField} defaultValue={e.lngLat.lat} size="small" inputRef={inputLat} id="outlined-basic" label="Latitude" />
        <Button style={styleFormField} type="submit" variant="contained" color="primary">Submit</Button>
      </form>
    </div>,
    content,
  );
};

const naviAppHandleClick = ({
  map, e, layerNames, setSelectedFeatures, setTab,
}) => {
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

  const popup = new mapboxgl.Popup()
    .setLngLat(feature.geometry.coordinates)
    // .setHTML(`<h3>${feature.properties.type}</h3>`)
    .setDOMContent(content)
    .addTo(map);
};

const setupMap = ({
  pointsSource,
  setPointsSource,
  navi,
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
          map.addSource('points', pointsSource);

          // Add a symbol layer
          map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points',
            layout: {
              'icon-image': 'custom-marker',
              'icon-anchor': 'bottom',
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
      const {
        loading: pointsLoading, // eslint-disable-line
        error: pointsError,
        data: pointsData,
      } = useQuery(ALL_POINTS);
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
      const popup = document.getElementsByClassName('mapboxgl-popup');
      switch (navi.current) {
        case 'App':
          naviAppHandleClick({
            map, layerNames, setSelectedFeatures, setTab, e,
          });
          break;
        case 'Edit':
          if (popup.length) {
            popup[0].remove();
          } else {
            naviEditHandleClick({
              map, e, mapContainer, pointsSource, setPointsSource,
            });
          }
          break;
        default:
          break;
      }
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
  navigation, tab, setFeatures, setSelectedFeatures, setTab,
}) => {
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);

  const {
    loading: pointsLoading, // eslint-disable-line
    error: pointsError,
    data: pointsData,
  } = useQuery(ALL_POINTS);

  console.log('pointsData: ', pointsData ? JSON.parse(pointsData.allPoints) : null);

  const [pointsSource, setPointsSource] = useState({
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      previousFeatureId: 0,
      features: [
      ],
    },
  });

  useEffect(() => {
    const doIt = () => {
      setPointsSource(pointsData.allPoints);
    };
    if (pointsData) { doIt(); }
  }, [pointsData]);

  const classes = useStyles();

  const mapContainer = useRef();
  const navi = useRef();
  navi.current = navigation;

  setupMap({
    pointsSource,
    setPointsSource,
    navi,
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
