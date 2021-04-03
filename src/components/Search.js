import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Button, Link, TextField, Card, Typography,
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

const Search = ({ tab, features }) => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [result, setResult] = useState([]);

  const classes = useStyles();

  const onSubmit = (e) => {
    e.preventDefault();
    if (textFieldValue === '') {
      setResult(features.reduce((acc, cur) => {
        if (cur.id) {
          if (!acc.find((x) => x.id === cur.id)) {
            acc.push(cur);
          }
        }
        return acc;
      }, []));
    } else {
      setResult(features
        ? [features.find((feature) => feature.id === parseInt(textFieldValue, 10))]
        : []);
    }
    setTextFieldValue('');
  };

  return (
    <form style={{ display: tab === 1 ? '' : 'none' }} onSubmit={onSubmit} className={classes.root} noValidate autoComplete="off">
      <TextField placeholder="Point ID" onChange={(x) => setTextFieldValue(x.target.value)} value={textFieldValue} id="outlined-basic" label="Search" variant="outlined" />
      <Card style={{ width: 'auto', display: result[0] ? '' : 'none', padding: 10 }}>
        {result.map((x, y) => (x
          ? (
            <div key={x.id.toString(10).concat(y)}>
              <Typography variant="h6" noWrap>Point ID: {x.id}</Typography>
              <Typography variant="body2" noWrap>Type: {x.properties.type}</Typography>
              <Typography variant="body2" noWrap>Coordinates: {x.geometry.coordinates.join(', ')}</Typography>
            </div>
          )
          : null
        ))}
      </Card>
    </form>
  );
};

export default Search;
