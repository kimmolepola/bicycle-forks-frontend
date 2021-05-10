import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Card, Typography,
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
  editPoint, setSelectedFeatures, selectedFeatures, tab, features,
}) => {
  const [searchFieldValue, setSearchFieldValue] = useState('');
  const [previousSearchFieldValue, setPreviousSearchFieldValue] = useState(null);
  const [active, setActive] = useState(null);
  const [activeEdit, setActiveEdit] = useState({
    id: '',
    title: '',
    category: '',
    groupID: '',
    type: '',
    longitude: 0,
    latitude: 0,
  });

  useEffect(() => {
    const doit = () => {
      setActiveEdit({
        id: active ? active.id ? active.id : '' : '',
        title: active ? active.properties.title ? active.properties.title : '' : '',
        category: active ? active.properties.category ? active.properties.category : '' : '',
        groupID: active ? active.properties.groupID ? active.properties.groupID : '' : '',
        type: active ? active.properties.type ? active.properties.type : '' : '',
        longitude: active ? active.geometry.coordinates[0] ? active.geometry.coordinates[0] : 0 : 0,
        latitude: active ? active.geometry.coordinates[1] ? active.geometry.coordinates[1] : 0 : 0,
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
    editPoint({
      variables: {
        id: activeEdit.id,
        title: activeEdit.title,
        category: activeEdit.category,
        type: activeEdit.type,
        groupid: activeEdit.groupID,
        lng: activeEdit.longitude,
        lat: activeEdit.latitude,
      },
    });
  };

  const search = ({ searchTerm }) => {
    if (searchFieldValue === '') {
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
        ? [features.find((feature) => feature.id === searchFieldValue)]
        : []);
    }
  };

  useEffect(() => {
    const doit = () => {
      if (features && features.length) {
        setSelectedFeatures(features.reduce((acc, cur) => {
          if (cur.id) {
            if (selectedFeatures.find((x) => x.id === cur.id)) {
              acc.push(cur);
            }
          }
          return acc;
        }, []));
      }
    };
    doit();
  }, [features]);

  const searchOnSubmit = (e) => {
    e.preventDefault();
    search({ searchTerm: searchFieldValue });
    setPreviousSearchFieldValue(searchFieldValue);
    setSearchFieldValue('');
  };

  return (
    <div className={classes.root} style={{ display: tab === 1 ? 'flex' : 'none', flexDirection: 'column' }}>
      <form className={classes.item} onSubmit={searchOnSubmit} noValidate autoComplete="off">
        <TextField placeholder="Point ID" onChange={(x) => setSearchFieldValue(x.target.value)} value={searchFieldValue} id="search" label="Search" variant="outlined" />
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
                <div key={x.id + y.toString()}>
                  <Typography variant="h6" noWrap>{x.properties.title}</Typography>
                  <Typography color="textSecondary" variant="body2" noWrap>ID: {x.id}</Typography>
                  <Typography variant="body2" noWrap>Category: {x.properties.category}</Typography>
                  <Typography variant="body2" noWrap>Type: {x.properties.type}</Typography>
                  <Typography variant="body2" noWrap>Group ID: {x.properties.groupID}</Typography>
                  <Typography variant="body2" noWrap>Longitude: {x.geometry.coordinates[0]}</Typography>
                  <Typography variant="body2" noWrap>Latitude: {x.geometry.coordinates[1]}</Typography>
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
