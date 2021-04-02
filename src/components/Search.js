import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Button, Link, TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));

const Search = ({ tab, map }) => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [mapPoint, setMapPoint] = useState(null);
  const [features, setFeatures] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    const ftrs = map.querySourceFeatures(
      map.getLayer('safebike-tileset').source,
      { sourceLayer: 'safebike-tileset' },
    );
    console.log(ftrs);
    setFeatures(ftrs);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(textFieldValue);
    const result = features.find((feature) => feature.id === parseInt(textFieldValue, 10));
    console.log('id: ', result ? result.id : null);
    console.log('type: ', result ? result.properties.type : null);
    console.log('coordinates: ', result ? result.geometry.coordinates : null);
    setTextFieldValue('');
  };

  return (
    <form style={{ display: tab === 1 ? '' : 'none' }} onSubmit={onSubmit} className={classes.root} noValidate autoComplete="off">
      <TextField placeholder="Point ID" onChange={(x) => setTextFieldValue(x.target.value)} value={textFieldValue} id="outlined-basic" label="Search" variant="outlined" />
    </form>
  );
};

export default Search;
