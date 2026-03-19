import * as React from 'react';
import { Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons
} from '@mui/x-data-grid';
import { useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

export default function ManageCase()
{
    const { token } = useAuth();
    const [rows, setRows] = useState([]);  
    const [loading, setLoading] = useState(true);
    const [doctorId, setDoctorId] = useState(null);

    React.useEffect(() => {
      const userJsonInner = localStorage.getItem("user");
      if (userJsonInner) {
        const user = JSON.parse(userJsonInner);

        if (user.userType === "doctor") {
          setDoctorId(user.id);
        } else {
          setDoctorId(null);
        }
      }
    }, []);

    React.useEffect(() => {
      if (token && doctorId) {
        fetchCases(token, doctorId);
      }
    }, [token, doctorId]);
  
    const fetchCases = async (tokenParam, doctorIdParam) => {
      if (!tokenParam || !doctorIdParam) return;
      try {
        const response = await api.get(`/getallcases/${doctorIdParam}`, {
          headers: {
            Authorization: `Bearer ${tokenParam}`
          }
        });
        setRows(response.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    
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
          await api.delete(`/deletecase/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setRows((prevRows) => prevRows.filter((row) => row.caseNo !== id)); 
      } catch (error) {
          console.error('Failed to Delete Case:', error);
      }
    };

    const handleCancelClick = (id) => () => {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      });
    };
    
    const processRowUpdate = async (newRow) => {
      try 
      {
        await api.put('/updatecase', newRow, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRows((prevRows) =>
          prevRows.map((row) => (row.caseNo === newRow.caseNo ? newRow : row))
        );
        return newRow;
      } catch (error) {
        console.error('Error Updating Case:', error);
        throw error;
      }
    };

    const handleRowModesModelChange = (newRowModesModel) => {
      setRowModesModel(newRowModesModel);
    };

    const columns = [
      {
          field: 'caseNo',
          headerName: 'Case No',
          type: 'number',
          width: 70,
          editable: false
      },
      {
          field: 'patientId',
          headerName: 'Patient Id',
          valueGetter: (_, row) => row.patient.id,
          type: 'number',
          width: 80,
          editable: false
      },
      {
          field: 'dateTime',
          headerName: 'Date & Time',
          width: 160,
          editable: false
      },
      { 
          field: 'firstName', 
          headerName: 'First Name', 
          valueGetter: (_, row) => row.patient?.firstName,
          width: 100, 
          editable: false 
      },
      {
        field: 'lastName',
        headerName: 'Last Name',
        valueGetter: (_, row) => row.patient?.lastName,
        width: 100,
        align: 'left',
        headerAlign: 'left',
        editable: false
      },
      {
        field: 'contact',
        headerName: 'Contact No',
        valueGetter: (_, row) => row.patient?.contact,
        width: 100,
        editable: false
      },
      {
          field: 'symptoms',
          headerName: 'Symptoms',
          width: 100,
          editable: true,
      },
      {
          field: 'diagnosis',
          headerName: 'Diagnosis',
          width: 100,
          editable: true,
      },
      {
          field: 'treatment',
          headerName: 'Treatment',
          width: 100,
          editable: true,
      },
      {
          field: 'advice',
          headerName: 'Advice',
          width: 100,
          editable: true,
      },
      {
          field: 'fees',
          headerName: 'Fees',
          type: 'number',
          width: 80,
          editable: true
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
      return <div>Loading Case Data...</div>;
    }

    return(
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
            getRowId={(row) => row.caseNo}
          />
        </Box>
    );
}
