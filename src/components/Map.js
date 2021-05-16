import React, { useRef, useEffect, useState } from 'react';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import {
  Box, Button, TextField, Typography,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ReactDOM from 'react-dom';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Theme from '../Theme';

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

const setupPopupAnchor = ({ mapContainer, e }) => {
  const mapDimensions = mapContainer.current.getBoundingClientRect();
  const popupMaxHeight = mapContainer.current.clientHeight / 2;
  const popupWidthAbout = 400;

  let popupAnchor = 'left';
  if (e.point.y <= popupMaxHeight / 2 && e.point.x < mapDimensions.width - popupWidthAbout) {
    popupAnchor = 'top-left';
  } else if (e.point.y <= popupMaxHeight / 2
    && e.point.x >= mapDimensions.width - popupWidthAbout) {
    popupAnchor = 'top-right';
  } else if (e.point.y >= mapDimensions.height - popupMaxHeight / 2
    && e.point.x < mapDimensions.width - popupWidthAbout) {
    popupAnchor = 'bottom-left';
  } else if (e.point.y >= mapDimensions.height - popupMaxHeight / 2
    && e.point.x >= mapDimensions.width - popupWidthAbout) {
    popupAnchor = 'bottom-right';
  } else if (e.point.x >= mapDimensions.width - popupWidthAbout) {
    popupAnchor = 'right';
  }
  return popupAnchor;
};

const handleRightClick = ({
  setFillCoorsNewPoint, handleSnackbarMessage, map, e, mapContainer, addPoint,
}) => {
  setFillCoorsNewPoint([e.lngLat.lng, e.lngLat.lat]);

  /*
  const divElement = document.createElement('div');

  const styleFormField = { marginTop: 10 };

  const popup = new mapboxgl.Popup({
    anchor: setupPopupAnchor({ mapContainer, e }),
  })
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .setDOMContent(divElement)
    .addTo(map);

  const PopupContent = () => {
    const [fields, setFields] = useState({
      title: '', type: '', category: '', groupID: '', lng: e.lngLat.lng, lat: e.lngLat.lat,
    });

    const onSubmit = async (ev) => {
      ev.preventDefault();
      const message = await addPoint({
        variables: {
          title: fields.title,
          category: fields.category,
          type: fields.type,
          groupID: fields.groupID,
          lng: fields.lng,
          lat: fields.lat,
        },
      });

      if (message) {
        handleSnackbarMessage({ severity: 'success', message: `${fields.title} added` });
      }

      popup.remove();
    };

    return (
      <div style={{ maxHeight: mapContainer.current.clientHeight / 2, overflowY: 'auto' }}>
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
            onChange={(x) => setFields({ ...fields, title: x.target.value })}
          />
          <TextField
            style={styleFormField}
            size="small"
            placeholder="e.g. line"
            id="type"
            label="Type"
            value={fields.type}
            onChange={(x) => setFields({ ...fields, type: x.target.value })}
          />
          <TextField
            style={styleFormField}
            size="small"
            placeholder=""
            id="groupid"
            label="GroupID"
            value={fields.groupID}
            onChange={(x) => setFields({ ...fields, groupID: x.target.value })}
          />
          <TextField
            style={styleFormField}
            size="small"
            placeholder="e.g. u-rack"
            id="category"
            label="Category"
            value={fields.category}
            onChange={(x) => setFields({ ...fields, category: x.target.value })}
          />
          <TextValidator
            style={styleFormField}
            size="small"
            id="longitude"
            label="Longitude"
            value={fields.lng}
            onChange={(x) => setFields({ ...fields, lng: x.target.value })}
            errorMessages={['this field is required', 'number required', 'number between -180 to 180 required', 'number between -180 to 180 required']}
            validators={['required', 'isFloat', 'minNumber:-180', 'maxNumber:180']}
          />
          <TextValidator
            style={styleFormField}
            size="small"
            id="latitude"
            label="Latitude"
            value={fields.lat}
            onChange={(x) => setFields({ ...fields, lat: x.target.value })}
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
  */
};

const handleLeftClick = ({
  map, e, setSelectedFeatures, setTab,
}) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['fills'], // replace this with the name of the layer
  });

  if (!features.length) {
    return;
  }

  const feature = features[0];

  const content = document.createElement('div');

  const popup = new mapboxgl.Popup()
    .setLngLat(feature.geometry.coordinates)
    // .setHTML(`<h3>${feature.properties.type}</h3>`)
    .setDOMContent(content)
    .addTo(map);

  const onClick = () => {
    setSelectedFeatures([feature]);
    popup.remove();
    setTab(1);
  };

  ReactDOM.render(
    <div>
      <Typography variant="body2">{feature.properties.title}</Typography>
      <Button style={{ marginTop: Theme.spacing(1) }} color="primary" variant="contained" onClick={onClick}>more</Button>
    </div>,
    content,
  );
};

const setupMap = ({
  setFillCoorsNewPoint,
  handleSnackbarMessage,
  addPoint,
  setMap,
  setTab,
  setSelectedFeatures,
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
    container: mapContainer.current,
    // style: 'mapbox://styles/mapbox/streets-v11',
    style: process.env.REACT_APP_MAPPBOX_STYLE,
    center: [lng, lat],
    zoom,
  });

  map.on('load', () => {
    // Add a data source containing GeoJSON data.
    map.addSource('fills', {
      type: 'geojson',
      tolerance: 0,
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          // These coordinates outline Maine.
          coordinates: [[
            [24.9454, 60.1755],
            [24.9554, 60.1755],
            [24.9554, 60.1655],
            [24.9454, 60.1655],
            [24.9454, 60.1755],
          ]],
        },
      },
    });

    // Add a new layer to visualize the polygon.
    map.addLayer({
      id: 'fills',
      type: 'fill',
      source: 'fills', // reference the data source
      layout: {},
      paint: {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.5,
      },
    });

    map.addSource('newFillPoints', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            id: 11,
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [24.9454, 60.1745],
            },
          },
          {
            id: 12,
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [24.9464, 60.1745],
            },
          },
        ],
      },
    });

    map.addLayer({
      id: 'newFillPoints',
      type: 'circle',
      source: 'newFillPoints',
      layout: {},
      paint: {
        'circle-color': '#ffffff',
      },
    });
    setMap(map);
  });
  /*
  map.on('load', () => {
    // Add an image to use as a custom marker
    map.loadImage(
      'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      (error, image) => {
        if (error) throw error;
        map.addImage('custom-marker', image);

        map.addSource('points', {
          type: 'geojson',
          tolerance: 0,
          data: {
            type: 'FeatureCollection',
            features: [
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
        setMap(map);
      },
    );
  });
*/
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'fills', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'fills', () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('contextmenu', (e) => {
    handleRightClick({
      setFillCoorsNewPoint, handleSnackbarMessage, map, e, mapContainer, addPoint,
    });
  });

  map.on('click', (e) => {
    handleLeftClick({
      map, setSelectedFeatures, setTab, e,
    });
  });

  map.on('move', () => {
    setLng(map.getCenter().lng.toFixed(4));
    setLat(map.getCenter().lat.toFixed(4));
    setZoom(map.getZoom().toFixed(2));
  });

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    defaultMode: 'draw_polygon',
  });
  map.addControl(draw);

  map.on('draw.create', updateArea);
  map.on('draw.delete', updateArea);
  map.on('draw.update', updateArea);

  return () => {
    map.remove();
  };
};

const Map = ({
  map, handleSnackbarMessage, setMap, addPoint, tab, setSelectedFeatures, setTab,
}) => {
  const classes = useStyles();
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);
  const [fillCoors, setFillCoors] = useState([]);
  const [fillCoorsNewPoint, setFillCoorsNewPoint] = useState([]);

  const mapContainer = useRef();

  /*
  useEffect(() => {
    const doIt = () => {
      if (fillCoorsNewPoint.length) {
        const currentFillCoors = [...fillCoors];
        if (!currentFillCoors.length) {
          currentFillCoors.push([fillCoorsNewPoint]);
        } else if (currentFillCoors[currentFillCoors.length - 1].length < 4) {
          currentFillCoors[currentFillCoors.length - 1].push(fillCoorsNewPoint);
        } else {
          currentFillCoors.push([fillCoorsNewPoint]);
        }
        setFillCoors(currentFillCoors);
        console.log('currentFillCoors: ', currentFillCoors);
        if (map) {
          const newFillPointsSource = map.getSource('newFillPoints');
          let features = [];
          if (currentFillCoors[currentFillCoors.length - 1].length < 4) {
            features = currentFillCoors[currentFillCoors.length - 1].map((x, y) => (
              {
                id: y,
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [x[0], x[1]],
                },
              }
            ));
          }
          console.log('features: ', features);
          const points = {
            type: 'FeatureCollection',
            features,
          };
          newFillPointsSource.setData(points);

          const fillsSource = map.getSource('fills');
          console.log('last: ', currentFillCoors.slice(-1));
          let coordinates = [];
          if (currentFillCoors.length === 1) {
            coordinates = currentFillCoors[0].length > 2
              ? currentFillCoors : [];
          } else {
            coordinates = currentFillCoors.slice(-1)[0].length > 2
              ? currentFillCoors
              : currentFillCoors.slice(0, -1);
          }
          console.log('coordinates: ', coordinates);
          const fills = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates,
            },
          };
          fillsSource.setData(fills);
        }
      }
    };
    doIt();
  }, [fillCoorsNewPoint]);
*/

  useEffect(() => {
    setupMap({
      setFillCoorsNewPoint,
      handleSnackbarMessage,
      addPoint,
      setMap,
      setTab,
      setSelectedFeatures,
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
      <div className={clsx('map-container', classes.mapContainer)} ref={mapContainer} />
    </Box>
  );
};

export default Map;
