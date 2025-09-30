import React from "react";
import { useState, useCallback } from "react";
import Api from "../Config/Api";
import { useTranslation } from "react-i18next";
import { notifyError, notifySuccess } from "../utilities/Toastify";
import { Helmet } from 'react-helmet-async';
import { Box, Stack, Typography, TablePagination } from '@mui/material';
import { Skeleton } from "antd";
import DeleteModal from "../Components/Modals/DeleteModal";
import ManagersTable from "../Components/Mangers/ManagersTable";
import ManagersCard from "../Components/Mangers/ManagersCard";
import ManagersToolbar from "../Components/Mangers/ManagersToolbar";
import ManagersModal from "../Components/Modals/ManagersModal";
import PermissionsModal from "../Components/Modals/PermissionsModal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import debounce from "lodash.debounce";
import { useMediaQuery } from "@mui/material";

const Mangers = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [openManagerModal, setOpenManagerModal] = useState(false);
  const [openPermissionsModal, setOpenPermissionsModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [managerToEdit, setManagerToEdit] = useState(null);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [managerForPermissions, setManagerForPermissions] = useState(null);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 400px)');
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
    }, 800),
    []
  );

  const fetchManagers = async () => {
    const response = await Api.get(`/api/managers`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: fetchManagers,
    keepPreviousData: true,
    staleTime: 5000,
  });

  const managers = data || [];

  const deleteMutation = useMutation({
    mutationFn: (managerId) => Api.delete(`/api/managers/${managerId}`),
    onSuccess: () => {
      notifySuccess(t("Mangers.ManagerDeleted"));
      queryClient.invalidateQueries(['managers']);
      setOpenDeleteModal(false);
      setManagerToDelete(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: (managerData) => {
      if (managerData.id) {
        return Api.patch(`/api/managers/${managerData.id}`, managerData);
      } else {
        return Api.post('/api/managers', managerData);
      }
    },
    onSuccess: () => {
      notifySuccess(managerToEdit ? t("Mangers.ManagerUpdated") : t("Mangers.ManagerAdded"));
      queryClient.invalidateQueries(['managers']);
      setOpenManagerModal(false);
      setManagerToEdit(null);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || t("Errors.generalError"));
    }
  });

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
    setSearchValue(e.target.value);
  };

  const handleSearchClick = () => {
    setPage(1);
  };

  const handleDelete = async () => {
    if (!managerToDelete?.id) return;
    deleteMutation.mutate(managerToDelete.id);
  };

  const handleSaveManager = (managerData) => {
    createOrUpdateMutation.mutate(managerData);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handlePageChange = (e, newPage) => {
    setPage(newPage + 1);
  };

  const handleAddManager = () => {
    setManagerToEdit(null);
    setOpenManagerModal(true);
  };

  const handleEditManager = (manager) => {
    setManagerToEdit(manager);
    setOpenManagerModal(true);
  };

  const handleDeleteManager = (manager) => {
    setManagerToDelete(manager);
    setOpenDeleteModal(true);
  };

  const handlePermissions = (manager) => {
    setManagerForPermissions(manager);
    setOpenPermissionsModal(true);
  };

  const handleClearFilter = () => {
    setSearchValue("");
    setPage(1);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, mt: 1 }}>
      <Helmet>
        <title>{t("Mangers.Mangers")}</title>
        <meta name="description" content={t("Mangers.ManagersDescription")} />
      </Helmet>
      
      <ManagersToolbar
        searchValue={searchValue}
        onSearchChange={handleSearch}
        onSearchClick={handleSearchClick}
        onClearFilter={handleClearFilter}
        onAddManager={handleAddManager}
        isSmallMobile={isSmallMobile}
        isLoading={isLoading}
      />

      {!isMobile ? (
        <ManagersTable
          managers={managers}
          isLoading={isLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={managers.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onEdit={handleEditManager}
          onDelete={handleDeleteManager}
          onPermissions={handlePermissions}
        />
      ) : (
        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Skeleton active />
            </Box>
          ) : !managers || managers.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ p: 3 }}>
              {t("Mangers.NoManagers")}
            </Typography>
          ) : (
            <Stack spacing={2}>
              {managers.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((manager) => (
                <ManagersCard
                  key={manager.id}
                  manager={manager}
                  onEdit={handleEditManager}
                  onDelete={handleDeleteManager}
                  onPermissions={handlePermissions}
                />
              ))}
            </Stack>
          )}
          
          <TablePagination
            component="div"
            count={managers.length || 0}
            page={page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t("Mangers.RowsPerPage")}
            sx={{ 
              overflow: 'auto',
              '& .MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                justifyContent: 'center'
              }
            }}
          />
        </Box>
      )}

      {openManagerModal && (
        <ManagersModal
          open={openManagerModal}
          onClose={() => {
            setOpenManagerModal(false);
            setManagerToEdit(null);
          }}
          manager={managerToEdit}
          onSave={handleSaveManager}
          isLoading={createOrUpdateMutation.isLoading}
        />
      )}

      {openPermissionsModal && (
        <PermissionsModal
          open={openPermissionsModal}
          onClose={() => {
            setOpenPermissionsModal(false);
            setManagerForPermissions(null);
          }}
          manager={managerForPermissions}
        />
      )}

      {openDeleteModal && (
        <DeleteModal
          open={openDeleteModal}
          onClose={() => {
            setOpenDeleteModal(false);
            setManagerToDelete(null);
          }}
          message={t("Mangers.DeleteManagerMessage")}
          title={t("Mangers.DeleteManager")}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isLoading}
        />
      )}
    </Box>
  );
};

export default Mangers;