import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { DatePicker } from 'antd';
import { 
  Box, 
  Paper, 
  IconButton, 
  Collapse, 
  Grid, 
  Typography,
  TextField,
  Button,
  FormControl,
  Stack,
  Autocomplete,
  InputAdornment,
  Fab
} from '@mui/material';

const { RangePicker } = DatePicker;

const FilterComponent = ({ 
  devises, 
  uniquePrixAchat, 
  uniquePrixVente, 
  onApplyFilters,
  onResetFilters 
}) => {
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    deviseID: '',
    prixAchat: '',
    prixVente: '',
    dateRange: null,
    dateDebut: '',
    dateFin: ''
  });

  // États pour les termes de recherche
  const [searchDevise, setSearchDevise] = useState('');
  const [searchPrixAchat, setSearchPrixAchat] = useState('');
  const [searchPrixVente, setSearchPrixVente] = useState('');
  
  // États pour les options filtrées
  const [filteredPrixAchat, setFilteredPrixAchat] = useState(uniquePrixAchat);
  const [filteredPrixVente, setFilteredPrixVente] = useState(uniquePrixVente);

  // Mise à jour des options filtrées lorsque les termes de recherche changent
  useEffect(() => {
    if (searchPrixAchat === '') {
      setFilteredPrixAchat(uniquePrixAchat);
    } else {
      const filtered = uniquePrixAchat.filter(prix => 
        prix.toString().toLowerCase().includes(searchPrixAchat.toLowerCase())
      );
      setFilteredPrixAchat(filtered);
    }
  }, [searchPrixAchat, uniquePrixAchat]);

  useEffect(() => {
    if (searchPrixVente === '') {
      setFilteredPrixVente(uniquePrixVente);
    } else {
      const filtered = uniquePrixVente.filter(prix => 
        prix.toString().toLowerCase().includes(searchPrixVente.toLowerCase())
      );
      setFilteredPrixVente(filtered);
    }
  }, [searchPrixVente, uniquePrixVente]);

  // Apply filters automatically whenever filters change
  useEffect(() => {
    const appliedFilters = {
      ...filters,
      // Ensure dates are properly formatted
      dateDebut: filters.dateRange && filters.dateRange[0] ? filters.dateRange[0].format('YYYY-MM-DD') : '',
      dateFin: filters.dateRange && filters.dateRange[1] ? filters.dateRange[1].format('YYYY-MM-DD') : ''
    };
    
    onApplyFilters(appliedFilters);
  }, [filters, onApplyFilters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (dates, dateStrings) => {
    setFilters(prev => ({
      ...prev,
      dateRange: dates,
      dateDebut: dateStrings[0] || '',
      dateFin: dateStrings[1] || ''
    }));
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
    // Réinitialiser les filtres lorsque le formulaire est caché
    if (showFilters) {
      setFilters({
        deviseID: '',
        prixAchat: '',
        prixVente: '',
        dateRange: null,
        dateDebut: '',
        dateFin: ''
      });
      setSearchDevise('');
      setSearchPrixAchat('');
      setSearchPrixVente('');
      setFilteredPrixAchat(uniquePrixAchat);
      setFilteredPrixVente(uniquePrixVente);
      onResetFilters();
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative', mb: 2 }}>

      <Collapse 
        in={showFilters}
        sx={{
          width: '100%',
          zIndex: 1000
        }}
      >
        <Paper elevation={3} sx={{ p: 3, mb: 2, backgroundColor: "#fff", borderRadius: "8px" }}>
          <Grid container spacing={3}>
            {/* Première ligne: tous les inputs avec labels en horizontal */}
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                {/* Devise */}
                <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: "bold", mr: 1, minWidth: '80px' }}>Devise</Typography>
                  <Autocomplete
                    options={devises}
                    getOptionLabel={(option) => `${option.name} (${option.symbol})`}
                    value={devises.find(d => d.id === filters.deviseID) || null}
                    onChange={(e, newValue) => {
                      handleFilterChange('deviseID', newValue ? newValue.id : '');
                    }}
                    inputValue={searchDevise}
                    onInputChange={(e, newInputValue) => {
                      setSearchDevise(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Sélectionner une devise"
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ced4da"
                          }
                        }}
                      />
                    )}
                    noOptionsText="Aucune devise trouvée"
                    sx={{ flexGrow: 1 }}
                  />
                </Grid>

                {/* Prix d'achat */}
                <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: "bold", mr: 1, minWidth: '100px' }}>Prix d'achat</Typography>
                  <FormControl fullWidth>
                    <Autocomplete
                      options={filteredPrixAchat}
                      getOptionLabel={(option) => option.toString()}
                      value={filters.prixAchat}
                      onChange={(e, newValue) => {
                        handleFilterChange('prixAchat', newValue || '');
                      }}
                      inputValue={searchPrixAchat}
                      onInputChange={(e, newInputValue) => {
                        setSearchPrixAchat(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Rechercher un prix"
                          fullWidth
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #ced4da"
                            }
                          }}
                        />
                      )}
                      freeSolo
                      noOptionsText="Aucun prix correspondant"
                      sx={{ flexGrow: 1 }}
                    />
                  </FormControl>
                </Grid>

                {/* Prix de vente */}
                <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: "bold", mr: 1, minWidth: '110px' }}>Prix de vente</Typography>
                  <FormControl fullWidth>
                    <Autocomplete
                      options={filteredPrixVente}
                      getOptionLabel={(option) => option.toString()}
                      value={filters.prixVente}
                      onChange={(e, newValue) => {
                        handleFilterChange('prixVente', newValue || '');
                      }}
                      inputValue={searchPrixVente}
                      onInputChange={(e, newInputValue) => {
                        setSearchPrixVente(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Rechercher un prix"
                          fullWidth
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #ced4da"
                            }
                          }}
                        />
                      )}
                      freeSolo
                      noOptionsText="Aucun prix correspondant"
                      sx={{ flexGrow: 1 }}
                    />
                  </FormControl>
                </Grid>

                {/* Période */}
                <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: "bold", mr: 1, minWidth: '70px' }}>Période</Typography>
                  <FormControl fullWidth>
                    <RangePicker 
                      onChange={handleDateChange}
                      value={filters.dateRange}
                      style={{ 
                        width: '100%',
                        padding: '8px',
                        borderColor: '#ced4da',
                        borderRadius: '4px'
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default FilterComponent;