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
  form: {
    '& > *': {
      width: '25ch',
      margin: theme.spacing(1),
      marginTop: 0,
    },
  },
}));

const Points = ({
  setSelectedFeatures, selectedFeatures, tab, features,
}) => {
  const [textFieldValue, setTextFieldValue] = useState('');
  const [active, setActive] = useState(null);
  const [activeEdit, setActiveEdit] = useState({
    id: '',
    title: '',
    category: '',
    groupID: '',
    type: '',
    longitude: '',
    latitude: '',
  });

  useEffect(() => {
    const doit = () => {
      setActiveEdit({
        id: active ? active.id ? active.id : '' : '',
        title: active ? active.properties.title ? active.properties.title : '' : '',
        category: active ? active.properties.category ? active.properties.category : '' : '',
        groupID: active ? active.properties.groupID ? active.properties.groupID : '' : '',
        type: active ? active.properties.type ? active.properties.type : '' : '',
        longitude: active ? active.geometry.coordinates[0] ? active.geometry.coordinates[0] : '' : '',
        latitude: active ? active.geometry.coordinates[1] ? active.geometry.coordinates[1] : '' : '',
      });
    };
    doit();
  }, [active]);

  useEffect(() => {
    const doIt = () => {
      setActive(null);
    };
    doIt();
  }, [tab]);

  const classes = useStyles();

  const editOnSubmit = (e) => {
    e.preventDefault();
    console.log('submit: ', activeEdit);
  };

  const searchOnSubmit = (e) => {
    e.preventDefault();
    if (textFieldValue === '') {
      if (features && features.length) {
        setSelectedFeatures(features.reduce((acc, cur) => {
          if (cur.id) {
            if (!acc.find((x) => x.id === cur.id)) {
              acc.push(cur);
            }
          }
          return acc;
        }, []));
      } else {
        setSelectedFeatures([]);
      }
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
        <TextField placeholder="Point ID" onChange={(x) => setTextFieldValue(x.target.value)} value={textFieldValue} id="search" label="Search" variant="outlined" />
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
            <form onSubmit={editOnSubmit} className={classes.form} noValidate autoComplete="off">
              <Typography variant="h6" noWrap>Edit</Typography>
              <Typography variant="body2" noWrap>Point ID: {active ? active.id : null}</Typography>
              <TextField onChange={(x) => setActiveEdit({ ...activeEdit, title: x.target.value })} value={activeEdit.title} label="Title" variant="outlined" />
              <TextField onChange={(x) => setActiveEdit({ ...activeEdit, category: x.target.value })} value={activeEdit.category} label="Category" variant="outlined" />
              <TextField onChange={(x) => setActiveEdit({ ...activeEdit, type: x.target.value })} value={activeEdit.type} label="Type" variant="outlined" />
              <TextField onChange={(x) => setActiveEdit({ ...activeEdit, groupID: x.target.value })} value={activeEdit.groupID} label="Group ID" variant="outlined" />
              <TextField onChange={(x) => setActiveEdit({ ...activeEdit, longitude: x.target.value })} value={activeEdit.longitude} label="Group ID" variant="outlined" />
              <TextField onChange={(x) => setActiveEdit({ ...activeEdit, latitude: x.target.value })} value={activeEdit.latitude} label="Group ID" variant="outlined" />
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Points;
