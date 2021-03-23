import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useQuery, gql } from '@apollo/client';
import Theme from '../Theme';

const FORK_LIST_HEADERS = gql`query{forkListHeaders}`;

const ALL_FORKS = gql`query{allForks}`;
/*
function createData(
  id,
  brand,
  model,
  tapered,
  diameter,
  threaded,
  rake,
  axletocrown,
  brake,
  blade,
  steerer,
) {
  return {
    id, brand, model, tapered, diameter, threaded, rake, axletocrown, brake, blade, steerer,
  };
}

const rows2 = [
  createData('Cupcake', 305, 3.7, 67, 4.3, 1, 1, 1, 1, 1, 1),
  createData('Donut', 452, 25.0, 51, 4.9, 1, 1, 1, 1, 1, 1),
  createData('Eclair', 262, 16.0, 24, 6.0, 1, 1, 1, 1, 1, 1),
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0, 1, 1, 1, 1, 1, 1),
  createData('Gingerbread', 356, 16.0, 49, 3.9, 1, 1, 1, 1, 1, 1),
  createData('Honeycomb', 408, 3.2, 87, 6.5, 1, 1, 1, 1, 1, 1),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3, 1, 1, 1, 1, 1, 1),
  createData('Jelly Bean', 375, 0.0, 94, 0.0, 1, 1, 1, 1, 1, 1),
  createData('KitKat', 518, 26.0, 65, 7.0, 1, 1, 1, 1, 1, 1),
  createData('Lollipop', 392, 0.2, 98, 0.0, 1, 1, 1, 1, 1, 1),
  createData('Marshmallow', 318, 0, 81, 2.0, 1, 1, 1, 1, 1, 1),
  createData('Nougat', 360, 19.0, 9, 37.0, 1, 1, 1, 1, 1, 1),
  createData('Oreo', 437, 18.0, 63, 4.0, 1, 1, 1, 1, 1, 1),
];
*/

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => (order === 'desc'
  ? (a, b) => descendingComparator(a, b, orderBy)
  : (a, b) => -descendingComparator(a, b, orderBy));

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

/*
const headCells = [
  {
    id: 'brand', numeric: false, disablePadding: true, label: 'Brand',
  },
  {
    id: 'model', numeric: false, disablePadding: false, label: 'Model',
  },
  {
    id: 'tapered', numeric: true, disablePadding: false, label: 'Tapered',
  },
  {
    id: 'diameter', numeric: true, disablePadding: false, label: 'Steerer Tube Diameter (inches)',
  },
  {
    id: 'threaded', numeric: false, disablePadding: false, label: 'Threaded',
  },
  {
    id: 'rake', numeric: true, disablePadding: false, label: 'Rake/Offset (mm)',
  },
  {
    id: 'axletocrown', numeric: true, disablePadding: false, label: 'Axle-to-Crown (A-C) (mm)',
  },
  {
    id: 'brake', numeric: false, disablePadding: false, label: 'Brake Mount',
  },
  {
    id: 'blade', numeric: false, disablePadding: false, label: 'Blade Material',
  },
  {
    id: 'steerer', numeric: false, disablePadding: false, label: 'Steerer Tube Material',
  },
];
*/

const EnhancedTableHead = ({
  headers, classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort,
}) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCells = headers.map((header) => ({
    id: header.id,
    numeric: header.type === 'numeric',
    disablePadding: header.id === 'brand',
    label: header.name,
  }));

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all forks' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          Forks
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const EnhancedTable = () => {
  const classes = useStyles();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('brand');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [headers, setHeaders] = useState(null);
  const [rows, setRows] = useState([]);

  const {
    loading: headersLoading, // eslint-disable-line
    error: headersError,
    data: headersData,
  } = useQuery(FORK_LIST_HEADERS);
  const {
    loading: forksLoading, // eslint-disable-line
    error: forksError,
    data: forksData,
  } = useQuery(ALL_FORKS);

  useEffect(() => {
    if (headersData && headersData.forkListHeaders) {
      setHeaders(JSON.parse(headersData.forkListHeaders));
    }
  }, [headersData]);

  useEffect(() => {
    if (forksData && forksData.allForks) {
      setRows(JSON.parse(forksData.allForks));
    }
  }, [forksData]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        {!headers || forksError
          ? <div style={{ padding: Theme.spacing(2) }}>{headersError || forksError ? 'error :(' : 'loading...'}</div>
          : (
            <TableContainer>
              <Table
                className={classes.table}
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
                aria-label="enhanced table"
              >
                <EnhancedTableHead
                  classes={classes}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={rows.length}
                  headers={headers}
                />
                <TableBody>
                  {stableSort(rows, getComparator(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isItemSelected = isSelected(row.id);
                      const labelId = `enhanced-table-checkbox-${index}`;
                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, row.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row.id.concat(index)}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': labelId }}
                            />
                          </TableCell>
                          <TableCell component="td" id={labelId} scope="row" padding="none">
                            {row.brand}
                          </TableCell>
                          <TableCell component="td" id={labelId} scope="row" padding="none">
                            {row.model}
                          </TableCell>
                          {Object.keys(row).map((key) => {
                            if (key === 'brand' || key === 'id' || key === 'model') {
                              return null;
                            }
                            const header = headers.find((hdr) => hdr.id === key);
                            const align = header ? header.type === 'numeric' ? 'right' : 'left' : 'left';
                            return (<TableCell key={key.concat(index)} component="td" id={labelId} scope="row" padding="none" align={align}>{row[key]}</TableCell>);
                          })}
                        </TableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </div>
  );
};

export default EnhancedTable;
