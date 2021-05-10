import React, { useRef, useEffect, useState } from 'react';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'; // eslint-disable-line
import {
  Box, Button, TextField,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ReactDOM from 'react-dom';

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
  map, e, mapContainer, addPoint,
}) => {
  const inputTitle = React.createRef();
  const inputType = React.createRef();
  const inputGroupID = React.createRef();
  const inputCategory = React.createRef();
  const inputLng = React.createRef();
  const inputLat = React.createRef();

  const content = document.createElement('div');

  const styleFormField = { marginTop: 10 };

  const popup = new mapboxgl.Popup({
    anchor: setupPopupAnchor({ mapContainer, e }),
  })
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .setDOMContent(content)
    .addTo(map);

  const onSubmit = (ev) => {
    ev.preventDefault();
    const newPoint = {
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

    addPoint({
      variables: {
        point: JSON.stringify(newPoint),
      },
    });

    popup.remove();
  };

  ReactDOM.render(
    <div style={{ maxHeight: mapContainer.current.clientHeight / 2, overflowY: 'auto' }}>
      <div>Add a point</div>
      <form onSubmit={onSubmit} noValidate autoComplete="off">
        <TextField style={styleFormField} size="small" inputRef={inputTitle} placeholder="e.g. Point A" id="title" label="Title" />
        <TextField style={styleFormField} size="small" inputRef={inputType} placeholder="e.g. line" id="type" label="Type" />
        <TextField style={styleFormField} size="small" inputRef={inputGroupID} placeholder="" id="groupid" label="GroupID" />
        <TextField style={styleFormField} size="small" inputRef={inputCategory} placeholder="e.g. u-rack" id="category" label="Category" />
        <TextField style={styleFormField} defaultValue={e.lngLat.lng} size="small" inputRef={inputLng} id="longitude" label="Longitude" />
        <TextField style={styleFormField} defaultValue={e.lngLat.lat} size="small" inputRef={inputLat} id="latitude" label="Latitude" />
        <Button style={styleFormField} type="submit" variant="contained" color="primary">Submit</Button>
      </form>
    </div>,
    content,
  );
};

const handleLeftClick = ({
  map, e, setSelectedFeatures, setTab,
}) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['points'], // replace this with the name of the layer
  });

  if (!features.length) {
    return;
  }

  const feature = features[0];
  feature.id = feature.id.toString();

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
            previousFeatureId: 0,
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

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'points', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'points', () => {
    map.getCanvas().style.cursor = '';
  });

  map.on('contextmenu', (e) => {
    handleRightClick({
      map, e, mapContainer, addPoint,
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

  return () => {
    map.remove();
  };
};

const Map = ({
  setMap, addPoint, tab, setSelectedFeatures, setTab,
}) => {
  const classes = useStyles();
  const [lng, setLng] = useState(24.9454);
  const [lat, setLat] = useState(60.1655);
  const [zoom, setZoom] = useState(13.76);

  const mapContainer = useRef();

  useEffect(() => {
    setupMap({
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
