import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Card,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
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
  handleSnackbarMessage,
  deletePoint,
  editPoint,
  setSelectedFeatures,
  selectedFeatures,
  tab,
  features,
}) => {
  const emptyActiveEdit = {
    delete: false,
    mapboxFeatureID: null,
    databaseID: null,
    title: '',
    category: '',
    groupID: '',
    type: '',
    longitude: 0,
    latitude: 0,
  };
  const [searchFieldValue, setSearchFieldValue] = useState('');
  const [activeEdit, setActiveEdit] = useState(emptyActiveEdit);

  const classes = useStyles();

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

  const handleEditClick = (feature) => {
    setActiveEdit({
      delete: false,
      mapboxFeatureID: feature.id,
      databaseID: feature.properties.databaseID,
      title: feature.properties.title ? feature.properties.title : '',
      category: feature.properties.category ? feature.properties.category : '',
      groupID: feature.properties.groupID ? feature.properties.groupID : '',
      type: feature.properties.type ? feature.properties.type : '',
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
    });
  };

  const handleDeleteDialogClose = () => {
    setActiveEdit({ ...activeEdit, delete: false });
  };

  const handleDelete = async () => {
    const deleteOperation = await deletePoint({ variables: { id: activeEdit.databaseID } });
    if (deleteOperation) {
      handleSnackbarMessage({ severity: 'success', message: `${activeEdit.title} deleted` });
      setActiveEdit(emptyActiveEdit);
    }
  };

  const editOnSubmit = async (e) => {
    e.preventDefault();
    const editOperation = await editPoint({
      variables: {
        id: activeEdit.databaseID,
        title: activeEdit.title,
        category: activeEdit.category,
        type: activeEdit.type,
        groupID: activeEdit.groupID,
        lng: activeEdit.longitude,
        lat: activeEdit.latitude,
      },
    });
    if (editOperation) {
      handleSnackbarMessage({ severity: 'success', message: `${activeEdit.title} edited` });
      setActiveEdit(emptyActiveEdit);
    }
  };

  const search = () => {
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

  const searchOnSubmit = (e) => {
    e.preventDefault();
    search();
    setSearchFieldValue('');
    setActiveEdit(emptyActiveEdit);
  };

  return (
    <div className={classes.root} style={{ display: tab === 1 ? 'flex' : 'none', flexDirection: 'column' }}>
      <Dialog
        open={activeEdit.delete}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete {activeEdit ? activeEdit.title : ''}?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action can not be undone
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
                  <Typography variant="body2" noWrap>{x.properties.category !== '' ? `Category: ${x.properties.category}` : null}</Typography>
                  <Typography variant="body2" noWrap>{x.properties.type !== '' ? `Type: ${x.properties.type}` : null}</Typography>
                  <Typography variant="body2" noWrap>{x.properties.groupID !== '' ? `Group ID: ${x.properties.groupID}` : null}</Typography>
                  <Typography variant="body2" noWrap>Longitude: {x.geometry.coordinates[0]}</Typography>
                  <Typography variant="body2" noWrap>Latitude: {x.geometry.coordinates[1]}</Typography>
                  <Button onClick={() => handleEditClick(x)} variant="outlined" size="small" style={{ marginTop: Theme.spacing(1) }}>Edit</Button>
                </div>
              )
              : null
            ))}
          </Card>
        </div>

        <div style={{ display: activeEdit.mapboxFeatureID ? '' : 'none', flex: 1 }}>
          <Card style={{ padding: 10 }}>
            <ValidatorForm onSubmit={editOnSubmit} className={classes.form} autoComplete="off">
              <Typography variant="h6" noWrap>Edit</Typography>
              <Typography variant="body2" noWrap>Point ID: {activeEdit.mapboxFeatureID}</Typography>
              <TextValidator
                errorMessages={['this field is required']}
                validators={['required']}
                onChange={(x) => setActiveEdit({ ...activeEdit, title: x.target.value })}
                value={activeEdit.title}
                label="Title"
                variant="outlined"
              />
              <TextField
                onChange={(x) => setActiveEdit({ ...activeEdit, category: x.target.value })}
                value={activeEdit.category}
                label="Category"
                variant="outlined"
              />
              <TextField
                onChange={(x) => setActiveEdit({ ...activeEdit, type: x.target.value })}
                value={activeEdit.type}
                label="Type"
                variant="outlined"
              />
              <TextField
                onChange={(x) => setActiveEdit({ ...activeEdit, groupID: x.target.value })}
                value={activeEdit.groupID}
                label="Group ID"
                variant="outlined"
              />
              <TextValidator
                errorMessages={['this field is required', 'number required', 'number between -180 to 180 required', 'number between -180 to 180 required']}
                validators={['required', 'isFloat', 'minNumber:-180', 'maxNumber:180']}
                onChange={(x) => setActiveEdit({ ...activeEdit, longitude: x.target.value })}
                value={activeEdit.longitude}
                label="Longitude"
                variant="outlined"
              />
              <TextValidator
                errorMessages={['this field is required', 'number required', 'number between -90 to 90 required', 'number between -90 to 90 required']}
                validators={['required', 'isFloat', 'minNumber:-90', 'maxNumber:90']}
                onChange={(x) => setActiveEdit({ ...activeEdit, latitude: x.target.value })}
                value={activeEdit.latitude}
                label="Latitude"
                variant="outlined"
              />
              <Button type="submit" variant="contained" color="primary">Submit</Button>
              <Button style={{ marginTop: Theme.spacing(4) }} color="secondary" onClick={() => setActiveEdit({ ...activeEdit, delete: true })} variant="outlined">Delete item</Button>
            </ValidatorForm>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Points;
