import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Button, Link, TextField, Card, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

const Search = ({
  setSelectedFeatures, selectedFeatures, tab, features,
}) => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [active, setActive] = useState(null);

  useEffect(() => {
    const doIt = () => {
      setActive(null);
    };
    doIt();
  }, [tab]);

  const classes = useStyles();

  const editOnSubmit = (e) => {
    e.preventDefault();
  };

  const searchOnSubmit = (e) => {
    e.preventDefault();
    if (textFieldValue === '') {
      setSelectedFeatures(features.reduce((acc, cur) => {
        if (cur.id) {
          if (!acc.find((x) => x.id === cur.id)) {
            acc.push(cur);
          }
        }
        return acc;
      }, []));
    } else {
      setSelectedFeatures(features
        ? [features.find((feature) => feature.id === parseInt(textFieldValue, 10))]
        : []);
    }
    setTextFieldValue('');
  };

  return (
    <div className={classes.root} style={{ display: tab === 1 ? 'flex' : 'none', flexDirection: 'column' }}>
      <form className={classes.item} onSubmit={searchOnSubmit} noValidate autoComplete="off">
        <TextField placeholder="Point ID" onChange={(x) => setTextFieldValue(x.target.value)} value={textFieldValue} id="outlined-basic" label="Search" variant="outlined" />
      </form>
      <div
        className={classes.item}
        style={{
          display: 'flex', flexDirection: 'row',
        }}
      >
        <div style={{
          display: selectedFeatures[0] ? '' : 'none', flex: 1,
        }}
        >
          <Card style={{ padding: 10 }}>
            {selectedFeatures.map((x, y) => (x
              ? (
                <div key={x.id.toString(10).concat(y)}>
                  <Typography variant="h6" noWrap>Point ID: {x.id}</Typography>
                  <Typography variant="body2" noWrap>Type: {x.properties.type}</Typography>
                  <Typography variant="body2" noWrap>Coordinates: {x.geometry.coordinates.join(', ')}</Typography>
                  <Button onClick={() => setActive(x)} variant="outlined" size="small" style={{ marginTop: Theme.spacing(1) }}>Edit</Button>
                </div>
              )
              : null
            ))}
          </Card>
        </div>

        <div style={{ display: active ? '' : 'none', flex: 1 }}>
          <Card style={{ padding: 10 }}>
            <form onSubmit={editOnSubmit} className={classes.root} noValidate autoComplete="off">
              <Typography variant="h6" noWrap>Edit</Typography>
              <Typography variant="body2" noWrap>Point ID: {active ? active.id : null}</Typography>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Search;
