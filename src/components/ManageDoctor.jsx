import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  Toolbar,
  ToolbarButton,
} from '@mui/x-data-grid';
import { useState } from 'react';
import api from '../api';

const token = localStorage.getItem('token');

let initialRows = [];

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;
  const tempId = `temp-${Math.random()}`; // temporary unique ID

  const handleClick = () => {
    setRows((oldRows) => [
      ...oldRows,
      { id: tempId, firstName: '', lastName: '', clinicName: '', contact:'', email:'',password:'', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [tempId]: { mode: GridRowModes.Edit, fieldToFocus: 'firstName' },
    }));
  };

  return (
    <Toolbar>
      <Tooltip title="Add record">
        <ToolbarButton onClick={handleClick}>
          <AddIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
}

export default function ManageDoctor() 
{
  const [rows, setRows] = useState(initialRows);
  const fetchDoctors = () => {
    api
      .get('/getalldoctors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        const transformedRows = response.data.map((row) => ({
          ...row,
          id: row.id, 
        }));  
        setRows(transformedRows);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  React.useEffect(() => 
    {
        fetchDoctors();
    }, []);

  
  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    await api.delete(`/deletedoctor/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      if(response.data === true){
        alert("Doctor deleted successfully");
        setRows((prevRows) => prevRows.filter((row) => row.id !== id)); 
        fetchDoctors();
      }else {
        alert("Doctor cannot be deleted because assistants or patients exist.");
      }
    })
    .catch(() => {
      alert("Something went wrong while deleting doctor.");
    });     
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    if (newRow.isNew) {
      try 
      {
        // Remove fields not expected by backend
        const rowWithoutId = 
        {
          firstName: newRow.firstName,
          lastName: newRow.lastName,
          clinicName: newRow.clinicName,
          contact: newRow.contact,
          email: newRow.email,
          password: newRow.password,
        };
        const response = await api.post('/adddoctor', rowWithoutId, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const savedDoctor = {
          ...response.data,
          id: response.data.id,
          isNew: false
        };

        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === newRow.id ? savedDoctor : row
          )
        );

        return savedDoctor;
      } catch (error) {
        console.error('Error adding doctor:', error);
        return newRow; // fallback to keep edit mode open
      }
    } 
    else 
    {
      try 
      {
        await api.put('/updatedoctor', newRow, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === newRow.id ? newRow : row))
        );
        return newRow;
      } catch (error) {
        console.error('Error updating doctor:', error);
        return newRow;
      }
    }
  };


  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
        field: 'id',
        headerName: 'Id',
        type: 'number',
        width: '80',
        editable: false
    },
    { 
        field: 'firstName', 
        headerName: 'First Name', 
        width: 120, 
        editable: true 
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      width: 120,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'clinicName',
      headerName: 'Clinic Name',
      width: 120,
      editable: true,
    },
    {
      field: 'contact',
      headerName: 'Contact No',
      width: 100,
      editable: true,
    },
    {
        field: 'email',
        headerName: 'Email',
        width: 180,
        editable: true,
    },
    {
        field: 'password',
        headerName: 'Password',
        width: 120,
        editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              material={{
                sx: {
                  color: 'primary.main',
                },
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        autoHeight
        key={rows.length}
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        getRowId={(row) => row.id}
        showToolbar
      />
    </Box>
  );
}
