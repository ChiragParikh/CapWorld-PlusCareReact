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
import { useAuth } from './AuthContext';

let initialRows = [];

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const doctorId = user?.id;

  const handleClick = () => 
  {
    const tempId = `temp-${Math.random()}`; // temporary unique ID
    setRows((oldRows) => [
      ...oldRows,
      { id: tempId, firstName: '', lastName: '', doctorId: doctorId, contact:'', email:'',password:'', isNew: true },
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

export default function ManageAssistant()
{
  const { token } = useAuth();
  const [rows, setRows] = useState(initialRows);  
  const [loading, setLoading] = useState(true);
  
  const userJson = localStorage.getItem("user");
  let doctorId = null;
  if (userJson) {
    const user = JSON.parse(userJson); // convert back to object
    doctorId = user.id;
  }  

  const fetchAssistants = async (tokenParam, doctorIdParam) => {
    if (!tokenParam || !doctorIdParam) return;
    try {
      const response = await api.get(`/getallassistants/${doctorIdParam}`, {
        headers: {
          Authorization: `Bearer ${tokenParam}`
        }
      });
      const transformedRows = response.data.map((row) => ({
        ...row,
        id: row.id,
        doctorId: row.doctor?.id || row.doctorId || doctorId,      
      }));
      setRows(transformedRows);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (token && doctorId) {
      fetchAssistants(token, doctorId);
    }
  }, [token, doctorId]);

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
    try {
        await api.delete(`/deleteassistant/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRows((prevRows) => prevRows.filter((row) => row.id !== id)); 
        fetchAssistants(token,doctorId);
    } catch (error) {
        console.error('Failed to Delete Assistant:', error);
    }
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
          doctorId: newRow.doctorId,
          contact: newRow.contact,
          email: newRow.email,
          password: newRow.password,
        };
        const response = await api.post('/addassistant', rowWithoutId, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const savedAssistant = {
          ...response.data,
          id: response.data.id,
          isNew: false
        };

        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === newRow.id ? savedAssistant : row
          )
        );

        return savedAssistant;
      } catch (error) {
        console.error('Error adding Assistant:', error);
        return newRow; // fallback to keep edit mode open
      }
    } 
    else 
    {
      try 
      {
        await api.put('/updateassistant', newRow, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === newRow.id ? newRow : row))
        );
        return newRow;
      } catch (error) {
        console.error('Error Updating Assistant:', error);
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
        width: 80,
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
      field: 'doctorId',
      headerName: 'Doctor Id',
      width: 120,
      editable: false,
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

  // Conditionally render UI based on state, not before hooks
  if (!token) {
    return <div>Unauthorized. Please log in.</div>;
  }

  if (loading) {
    return <div>Loading assistant data...</div>;
  }

  return (

    <>
      {!token && <div>Unauthorized. Please log in.</div>}

      {token && loading && <div>Loading assistant data...</div>}

      {token && !loading && (

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
      )}  
    </>  
  );
};
