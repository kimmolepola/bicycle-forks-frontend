import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Button, Link, TextField, Card, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import Theme from '../Theme';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      width: '25ch',
    },
  },
  item: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const Add = ({
  map, setSelectedFeatures, selectedFeatures, tab, features,
}) => {
  const [pointTypeValue, setPointTypeValue] = useState('');
  const [pointCoordinateXValue, setPointCoordinateXValue] = useState('');
  const [pointCoordinateYValue, setPointCoordinateYValue] = useState('');

  const classes = useStyles();

  const addOnSubmit = (e) => {
    e.preventDefault();
    console.log(pointTypeValue, pointCoordinateXValue, pointCoordinateYValue);

    const marker1 = new mapboxgl.Marker()
      .setLngLat([24.9454, 60.1655])
      .addTo(map);
    console.log('marker: ', marker1);
  };

  return (
    <div className={classes.root} style={{ display: tab === 99 ? 'flex' : 'none', flexDirection: 'column' }}>
      <form className={classes.item} onSubmit={addOnSubmit} noValidate autoComplete="off">
        <TextField placeholder="Point Type" onChange={(x) => setPointTypeValue(x.target.value)} value={pointTypeValue} id="outlined-basic" label="PointType" variant="outlined" />
        <TextField placeholder="Point Coor X" onChange={(x) => setPointCoordinateXValue(x.target.value)} value={pointCoordinateXValue} id="outlined-basic" label="PointCoorX" variant="outlined" />
        <TextField placeholder="Point Coor Y" onChange={(x) => setPointCoordinateYValue(x.target.value)} value={pointCoordinateYValue} id="outlined-basic" label="PointCoorY" variant="outlined" />
        <Button type="submit" variant="contained" color="primary">Add</Button>
      </form>
    </div>
  );
};

export default Add;
