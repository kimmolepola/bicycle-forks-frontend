import React, {
  useRef, useEffect, useState,
} from 'react';
import ReactDOM from 'react-dom';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import {
  Box, Button, TextField,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import defaultMapboxDrawStyles from '@mapbox/mapbox-gl-draw/src/lib/theme';
import './mapbox-gl-draw.css';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import polylabel from '@mapbox/polylabel';

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

const createFeatureEditPopup = ({ mapContainer, map, feature }) => {
  const coors = feature.features[0].geometry.coordinates.length === 2
    ? feature.features[0].geometry.coordinates
    : polylabel(feature.features[0].geometry.coordinates);

  console.log('coors: ', coors);

  const inputTitle = React.createRef();
  const inputType = React.createRef();
  const inputGroupID = React.createRef();
  const inputCategory = React.createRef();
  const inputLng = React.createRef();
  const inputLat = React.createRef();

  const divElement = document.createElement('div');

  const styleFormField = { marginTop: 10 };

  const popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(coors)
    .setDOMContent(divElement)
    .addTo(map);

  const removePopup = () => {
    popup.remove();
  };

  const PopupContent = () => {
    const [fields, setFields] = useState({
      title: '', type: '', category: '', groupID: '', lng: coors[0], lat: coors[1],
    });

    const onSubmit = (ev) => {
      ev.preventDefault();
      const newPoint = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            fields.lng,
            fields.lat,
          ],
        },
        properties: {
          title: fields.title,
          type: fields.type,
          category: fields.category,
          groupID: fields.groupID,
        },
      };

      popup.remove();
    };

    return (
      <div style={{ maxHeight: mapContainer.current.clientHeight / 3, overflowY: 'auto' }}>
        <div>Add a point</div>
        <ValidatorForm onSubmit={onSubmit} autoComplete="off">
          <TextValidator
            style={styleFormField}
            size="small"
            placeholder="e.g. Point A"
            id="title"
            label="Title"
            errorMessages={['this field is required']}
            validators={['required']}
            value={fields.title}
            onChange={(y) => setFields({ ...fields, title: y.target.value })}
          />
          <TextField
            style={styleFormField}
            size="small"
            placeholder="e.g. line"
            id="type"
            label="Type"
            value={fields.type}
            onChange={(y) => setFields({ ...fields, type: y.target.value })}
          />
          <TextField
            style={styleFormField}
            size="small"
            placeholder=""
            id="groupid"
            label="GroupID"
            value={fields.groupID}
            onChange={(y) => setFields({ ...fields, groupID: y.target.value })}
          />
          <TextField
            style={styleFormField}
            size="small"
            placeholder="e.g. u-rack"
            id="category"
            label="Category"
            value={fields.category}
            onChange={(y) => setFields({ ...fields, category: y.target.value })}
          />
          <TextValidator
            style={styleFormField}
            size="small"
            id="longitude"
            label="Longitude"
            value={fields.lng}
            onChange={(y) => setFields({ ...fields, lng: y.target.value })}
            errorMessages={['this field is required', 'number required', 'number between -180 to 180 required', 'number between -180 to 180 required']}
            validators={['required', 'isFloat', 'minNumber:-180', 'maxNumber:180']}
          />
          <TextValidator
            style={styleFormField}
            size="small"
            id="latitude"
            label="Latitude"
            value={fields.lat}
            onChange={(y) => setFields({ ...fields, lat: y.target.value })}
            errorMessages={['this field is required', 'number required', 'number between -90 to 90 required', 'number between -90 to 90 required']}
            validators={['required', 'isFloat', 'minNumber:-90', 'maxNumber:90']}
          />
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
  setCurrentPopup,
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
    setCurrentPopup(createFeatureEditPopup({ feature: x, map, mapContainer }));
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
  const [currentPopup, setCurrentPopup] = useState(null);

  const mapContainer = useRef();
  const asdf = useRef();
  asdf.current = currentPopup;

  if (map) {
    console.log(map.getStyle());
  }

  useEffect(() => {
    const doit = () => {
      if (currentPopup) {
        currentPopup.setLngLat(currentPopup.getLngLat());
      }
    };
    doit();
  }, [currentPopup]);

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
      setCurrentPopup,
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
