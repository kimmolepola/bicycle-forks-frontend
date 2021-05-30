import React, {
  useRef, useEffect, useState,
} from 'react';
import ReactDOM from 'react-dom';
  import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import {
  Box,
  Button,
  TextField,
  Typography,
  Fab,
  AppBar,
  CssBaseline,
  Grid,
  Paper,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import defaultMapboxDrawStyles from '@mapbox/mapbox-gl-draw/src/lib/theme';
import './mapbox-gl-draw.css';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import polylabel from '@mapbox/polylabel';
import { Search as SearchIcon, Add as AddIcon } from '@material-ui/icons';

const handleRightClick = ({ e, draw }) => {
  const divElement = document.createElement('div');

  const PopupContent = () => {
    const [open, setOpen] = useState(true);

    return (
      <div>
        <Menu
          id="simple-menu"
          anchorReference="anchorPosition"
          anchorPosition={{ left: e.originalEvent.clientX, top: e.originalEvent.clientY }}
          keepMounted
          open={open}
          onClose={() => setOpen(false)}
        >
          <MenuItem onClick={() => { draw.changeMode('draw_point'); setOpen(false); }}>Add point</MenuItem>
          <MenuItem onClick={() => { draw.changeMode('draw_polygon'); setOpen(false); }}>Add area</MenuItem>
        </Menu>
      </div>
    );
  };

  ReactDOM.render(
    <PopupContent />,
    divElement,
  );
};

const createFeatureEditPopup = ({
  handleSnackbarMessage, editFeature, addFeature, draw, mapContainer, map, feature,
}) => {
  if (!feature || !map || !mapContainer || !draw) {
    return null;
  }
  const geometryType = feature.features[0].geometry.type;
  const coordinates = geometryType === 'Point'
    ? [feature.features[0].geometry.coordinates]
    : feature.features[0].geometry.coordinates[0].slice(0, -1);

  const divElement = document.createElement('div');

  const styleFormField = { marginTop: 10 };

  const popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(geometryType === 'Point' ? coordinates[0] : polylabel([coordinates]))
    .setDOMContent(divElement)
    .addTo(map);

  const PopupContent = () => {
    const [title, setTitle] = useState(feature.features[0].properties.title || '');
    const [type, setType] = useState(feature.features[0].properties.type || '');
    const [coors, setCoors] = useState(coordinates);

    const onSubmit = async (ev) => {
      ev.preventDefault();

      draw.setFeatureProperty(feature.features[0].id, 'title', title);
      draw.setFeatureProperty(feature.features[0].id, 'type', type);
      draw.changeMode('simple_select');

      let message = null;

      if (editFeature) {
        message = await editFeature({
          variables: {
            id: feature.features[0].id,
            title,
            type,
            geometryType: feature.features[0].geometry.type,
            coordinates: coors,
          },
        });
      } else if (addFeature) {
        message = await addFeature({
          variables: {
            id: feature.features[0].id,
            title,
            type,
            geometryType: feature.features[0].geometry.type,
            coordinates: coors,
          },
        });
      }

      if (message) {
        handleSnackbarMessage({ severity: 'success', message: `${title} ${addFeature ? ' created' : ' edited'}` });
      }

      popup.remove();
    };

    const popupTitleText = () => {
      if (geometryType === 'Point' && editFeature) {
        return 'Edit point';
      }
      if (geometryType !== 'Point' && editFeature) {
        return 'Edit area';
      }
      if (geometryType === 'Point' && !editFeature) {
        return 'Add a point';
      }
      return 'Add an area';
    };

    return (
      <div style={{ marginTop: 10, maxHeight: mapContainer.current.clientHeight / 3, overflowY: 'auto' }}>
        <Typography variant="h6">{popupTitleText()}</Typography>
        <ValidatorForm onSubmit={onSubmit} autoComplete="off">
          <TextValidator
            style={styleFormField}
            size="small"
            placeholder={geometryType === 'Point' ? 'e.g. Point A' : 'e.g. Area A'}
            id="title"
            label="Title"
            errorMessages={['this field is required']}
            validators={['required']}
            value={title}
            onChange={(y) => setTitle(y.target.value)}
          />
          <TextField
            style={styleFormField}
            size="small"
            placeholder={geometryType === 'Point' ? 'e.g. Bike rack' : 'e.g. Parking area'}
            id="type"
            label="Type"
            value={type}
            onChange={(y) => setType(y.target.value)}
          />
          {coors.map((x, currentIndex) => (
            <div style={{ display: 'none' }} key={x}>
              <TextValidator
                style={styleFormField}
                size="small"
                id={`longitude${coors.length}` > 1 ? currentIndex : null}
                label={coors.length > 1 ? `Point ${currentIndex} longitude` : 'Longitude'}
                value={x[0]}
                onChange={(y) => setCoors(coors.map((z, i) => {
                  if (currentIndex === i) {
                    return [y.target.value, z[1]];
                  }
                  return z;
                }))}
                errorMessages={['this field is required', 'number required', 'number between -180 to 180 required', 'number between -180 to 180 required']}
                validators={['required', 'isFloat', 'minNumber:-180', 'maxNumber:180']}
              />
              <TextValidator
                style={styleFormField}
                size="small"
                id={`latitude${coors.length}` > 1 ? currentIndex : null}
                label={coors.length > 1 ? `Point ${currentIndex} latitude` : 'Latitude'}
                value={x[1]}
                onChange={(y) => setCoors(coors.map((z, i) => {
                  if (currentIndex === i) {
                    return [z[0], y.target.value];
                  }
                  return z;
                }))}
                errorMessages={['this field is required', 'number required', 'number between -90 to 90 required', 'number between -90 to 90 required']}
                validators={['required', 'isFloat', 'minNumber:-90', 'maxNumber:90']}
              />
            </div>
          )) }
          <Button style={styleFormField} type="submit" variant="contained" color="primary">Submit</Button>
        </ValidatorForm>
      </div>
    );
  };
  ReactDOM.render(
    <PopupContent />,
    divElement,
  );
  return popup;
};

const setupMap = ({
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
}) => {
  mapboxgl.workerClass = MapboxWorker;
  mapboxgl.accessToken = process.env.REACT_APP_MAPBOXGL_ACCESSTOKEN;

  const map = new mapboxgl.Map({
    attributionControl: false,
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [lng, lat],
    zoom,
  });

  const draw = new MapboxDraw({
    userProperties: true,
    displayControlsDefault: false,
    controls: controls.draw,
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

  map.on('draw.delete', async (x) => {
    const message = await deleteFeature({ variables: { id: x.features[0].id } });
    if (message) {
      handleSnackbarMessage({ severity: 'success', message: `${x.features[0].properties.title} deleted` });
    }
  });

  map.on('draw.update', (x) => {
    setCurrentPopup(createFeatureEditPopup({
      handleSnackbarMessage, editFeature, draw, feature: x, map, mapContainer,
    }));
  });
  map.on('draw.create', (x) => {
    setCurrentPopup(createFeatureEditPopup({
      handleSnackbarMessage, addFeature, draw, feature: x, map, mapContainer,
    }));
  });

  map.on('load', () => {
    map.addControl(draw);
    if (controls.navigation) {
      map.addControl(new mapboxgl.NavigationControl());
    }
    if (controls.geolocate) {
      map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }));
    }
    if (controls.attribution) {
      map.addControl(new mapboxgl.AttributionControl({
        compact: true,
      }));
    }
    if (controls.scale) {
      const scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial',
      });
      map.addControl(scale);
      scale.setUnit('metric');
    }
    if (controls.fullScreen) {
      map.addControl(new mapboxgl.FullscreenControl());
    }

    map.addSource('labels', {
      type: 'geojson',
      tolerance: 0,
      data: {
        type: 'FeatureCollection',
        previousFeatureId: 0,
        features: [
        ],
      },
    });

    // Add a symbol layer
    map.addLayer({
      id: 'labels',
      type: 'symbol',
      source: 'labels',
      layout: {
        // get the title name from the source's "title" property
        'text-field': ['get', 'title'],
        'text-font': [
          'Open Sans Semibold',
          'Arial Unicode MS Bold',
        ],
        'text-offset': [
          'case',
          ['==', ['geometry-type'], 'Point'],
          ['literal', [0, 0.4]],
          ['literal', [0, 0]],
        ],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': 'white',
        'text-halo-blur': 0,
        'text-halo-width': 1,
        'text-halo-color': 'black',
      },
    });

    getFeatures();
    setDraw(draw);
    setMap(map);
  });

  map.on('contextmenu', (e) => {
    handleRightClick({ e, draw });
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

export default setupMap;
