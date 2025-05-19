import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addprix, updatePrix, deletePrix, deleteMultiplePrix } from './Actions';
import { Form } from "react-bootstrap";
import { Fab, Collapse } from "@mui/material"; // Ajout de Collapse ici
import axios from 'axios';
import "jspdf-autotable";
import Search from "../Acceuil/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from "xlsx";
import { useOpen } from "../Acceuil/OpenProvider";
import Swal from 'sweetalert2';
import { faTrash, faFileExcel, faPlus, faEdit, faPrint, faFilePdf, faFilter } from "@fortawesome/free-solid-svg-icons";"@fortawesome/free-solid-svg-icons";
import '../style.css';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import ExpandRTable from "../components/ExpandRTable";
import FilterComponent from './FilterComponent';

const AddPrixForm = ({ onPrixAdded }) => {
    const { dynamicStyles } = useOpen();
    const [definit_prix, setdefinit_prix] = useState([]);
    const [formData, setFormData] = useState({
        devseID: '',
        prix_achat: '',
        prix_vente: '',
        date_d: '',
        date_f: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [devises, setDevises] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // États pour les filtres
    const [activeFilters, setActiveFilters] = useState({
        deviseID: '',
        prixAchat: '',
        prixVente: '',
        dateDebut: null,
        dateFin: null
    });
    
    const dispatch = useDispatch();

    // États pour ExpandRTable
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedItems, setSelectedItems] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        fetchDevises();
        fetchPrix();
    }, []);

    const fetchDevises = () => {
        axios.get("http://127.0.0.1:8000/api/devises")
            .then(response => {
                setDevises(response.data.devises || []);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des devises:", error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur!",
                    text: "Une erreur est survenue lors de la récupération des devises.",
                });
            });
    };

    const fetchPrix = () => {
        axios.get("http://127.0.0.1:8000/api/definit_prix")
            .then(response => {
                setdefinit_prix(response.data.definie_prix || []);
            })
            .catch(error => console.error("Erreur lors de la récupération des prix:", error));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

   // Dans la fonction handleSubmit, avant de sauvegarder
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérification de chevauchement de période
    const selectedDeviseId = parseInt(formData.devseID);
    const newStartDate = new Date(formData.date_d);
    const newEndDate = new Date(formData.date_f);
    
    // Vérifier si les dates sont valides
    if (newEndDate < newStartDate) {
        Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "La date de fin doit être postérieure à la date de début.",
        });
        return;
    }
    
    // Vérifier s'il existe déjà un prix pour cette devise avec une période qui chevauche
    const existingOverlap = definit_prix.find(prix => {
        // Ignorer l'élément en cours d'édition
        if (isEditing && prix.id === editingId) return false;
        
        // Vérifier si c'est la même devise
        if (prix.devise_i_d?.id !== selectedDeviseId) return false;
        
        const existingStartDate = new Date(prix.date_d);
        const existingEndDate = new Date(prix.date_f);
        
        // Vérifier le chevauchement de périodes
        return (
            (newStartDate <= existingEndDate && newEndDate >= existingStartDate) ||
            (existingStartDate <= newEndDate && existingEndDate >= newStartDate)
        );
    });
    
    if (existingOverlap) {
        Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: `Un prix existe déjà pour cette devise pendant la période du ${new Date(existingOverlap.date_d).toLocaleDateString()} au ${new Date(existingOverlap.date_f).toLocaleDateString()}.`,
        });
        return;
    }
    
    // Poursuivre avec la sauvegarde si aucun chevauchement
    try {
        if (isEditing) {
            await dispatch(updatePrix(editingId, formData));
            Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Prix mis à jour avec succès.",
            });
            setIsEditing(false);
            setEditingId(null);
        } else {
            await dispatch(addprix(formData));
            Swal.fire({
                icon: "success",
                title: "Succès!",
                text: "Prix défini avec succès.",
            });
            if (onPrixAdded) onPrixAdded(formData.id);
        }
        resetForm();
        fetchPrix();
    } catch (error) {
        console.error("Erreur lors de l'opération:", error);
        Swal.fire({
            icon: "error",
            title: "Erreur!",
            text: "Une erreur est survenue lors de l'opération.",
        });
    }
};
    const resetForm = () => {
        setFormData({
            devseID: '',
            prix_achat: '',
            prix_vente: '',
            date_d: '',
            date_f: ''
        });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'definit_prix');
        XLSX.writeFile(workbook, 'prix_table.xlsx');
      };
      
  
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Liste des Prix', 14, 16);
        doc.autoTable({
            head: [['Devise', 'Prix d\'achat', 'Prix de vente', 'Date début', 'Date fin']],
            body: formattedData.map(item => [
                item.devseID, item.prix_achet, item.prix_vente, item.date_d, item.date_f
            ]),
            startY: 20,
            theme: 'grid'
        });
        doc.save('prix_table.pdf');
    };
  
    const printTable = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Liste des Prix</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>Liste des Prix</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Devise</th>
                                <th>Prix d'achat</th>
                                <th>Prix de vente</th>
                                <th>Date début</th>
                                <th>Date fin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formattedData.map(item => `
                                <tr>
                                    <td>${item.devseID}</td>
                                    <td>${item.prix_achet}</td>
                                    <td>${item.prix_vente}</td>
                                    <td>${item.date_d}</td>
                                    <td>${item.date_f}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleEdit = (item) => {
        const originalPrix = definit_prix.find(prix => prix.id === item.id);
        if (!originalPrix) return;
        
        setFormData({
            devseID: originalPrix.devise_i_d?.id || '',
            prix_achat: originalPrix.prix_achat || '',
            prix_vente: originalPrix.prix_vente || '',
            date_d: originalPrix.date_d || '',
            date_f: originalPrix.date_f || ''
        });
        
        setIsEditing(true);
        setEditingId(item.id);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Êtes-vous sûr?",
            text: "Voulez-vous vraiment supprimer ce prix?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, supprimer!",
            cancelButtonText: "Annuler"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(deletePrix(id));
                    Swal.fire("Supprimé!", "Le prix a été supprimé avec succès.", "success");
                    fetchPrix();
                } catch (error) {
                    console.error("Erreur lors de la suppression:", error);
                    Swal.fire("Erreur!", "Une erreur est survenue lors de la suppression.", "error");
                }
            }
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) return;
        
        Swal.fire({
            title: "Êtes-vous sûr?",
            text: `Voulez-vous vraiment supprimer ${selectedItems.length} prix sélectionnés?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, supprimer!",
            cancelButtonText: "Annuler"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(deleteMultiplePrix(selectedItems));
                    Swal.fire("Supprimés!", `${selectedItems.length} prix ont été supprimés avec succès.`, "success");
                    setSelectedItems([]);
                    setSelectAll(false);
                    fetchPrix();
                } catch (error) {
                    console.error("Erreur lors de la suppression multiple:", error);
                    Swal.fire("Erreur!", "Une erreur est survenue lors de la suppression multiple.", "error");
                }
            }
        });
    };

    const handleSelectAllChange = () => {
        setSelectAll(!selectAll);
        setSelectedItems(selectAll ? [] : formattedData.map(item => item.id));
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderExpandedRow = (item) => {
        return (
            <div>
                <h4>Détails du prix</h4>
                <p><strong>Devise:</strong> {item.devseID}</p>
                <p><strong>Prix d'achat:</strong> {item.prix_achet}</p>
                <p><strong>Prix de vente:</strong> {item.prix_vente}</p>
                <p><strong>Période de validité:</strong> Du {item.date_d} au {item.date_f}</p>
            </div>
        );
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const highlightText = (text, searchTerm) => {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.toString().split(regex).map((part, i) => 
            regex.test(part) ? <span key={i} style={{backgroundColor: 'yellow'}}>{part}</span> : part
        );
    };

    // Gestion des filtres
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setPage(0);
    };

    const handleResetFilters = () => {
        setActiveFilters({
            deviseID: '',
            prixAchat: '',
            prixVente: '',
            dateDebut: null,
            dateFin: null
        });
    };

    const columns = [
        { key: "devseID", label: "Devise", minWidth: 100 },
        { key: "prix_achet", label: "Prix d'achat", minWidth: 100 },
        { key: "prix_vente", label: "Prix de vente", minWidth: 100 },
        { key: "date_d", label: "Date début", minWidth: 100 },
        { key: "date_f", label: "Date fin", minWidth: 100 }
    ];
      
    const formattedData = definit_prix.map(prix => ({
        id: prix.id,
        devseID: prix.devise_i_d?.code || '',
        prix_achet: prix.prix_achat || '',
        prix_vente: prix.prix_vente || '',
        date_d: prix.date_d || '',
        date_f: prix.date_f || '',
        devise_i_d: prix.devise_i_d
    }));

    const uniquePrixAchat = [...new Set(formattedData.map(item => item.prix_achet))].filter(Boolean);
    const uniquePrixVente = [...new Set(formattedData.map(item => item.prix_vente))].filter(Boolean);

    const applyFilters = (data) => {
        return data.filter(item => {
            // Filtre par devise
            if (activeFilters.deviseID && item.devise_i_d?.id !== parseInt(activeFilters.deviseID)) return false;
            
            // Filtre par prix d'achat
            if (activeFilters.prixAchat && item.prix_achet !== activeFilters.prixAchat) return false;
            
            // Filtre par prix de vente
            if (activeFilters.prixVente && item.prix_vente !== activeFilters.prixVente) return false;
            
            // Filtre par période (logique améliorée)
            if (activeFilters.dateDebut || activeFilters.dateFin) {
                const itemStartDate = new Date(item.date_d);
                const itemEndDate = new Date(item.date_f);
                
                if (activeFilters.dateDebut && activeFilters.dateFin) {
                    const filterStartDate = new Date(activeFilters.dateDebut);
                    const filterEndDate = new Date(activeFilters.dateFin);
                    
                    // La période sélectionnée chevauche la période de l'élément
                    return (
                        // Cas 1: La période du filtre est complètement incluse dans la période de l'élément
                        (filterStartDate >= itemStartDate && filterEndDate <= itemEndDate) ||
                        
                        // Cas 2: L'élément est complètement inclus dans la période du filtre
                        (itemStartDate >= filterStartDate && itemEndDate <= filterEndDate) ||
                        
                        // Cas 3: Chevauchement - la date de début du filtre est dans la période de l'élément
                        (filterStartDate >= itemStartDate && filterStartDate <= itemEndDate) ||
                        
                        // Cas 4: Chevauchement - la date de fin du filtre est dans la période de l'élément
                        (filterEndDate >= itemStartDate && filterEndDate <= itemEndDate)
                    );
                } else if (activeFilters.dateDebut) {
                    const filterStartDate = new Date(activeFilters.dateDebut);
                    // La date de début du filtre est avant ou égale à la date de fin de l'élément
                    // ET la date de fin de l'élément est après ou égale à la date de début du filtre
                    return filterStartDate <= itemEndDate && itemEndDate >= filterStartDate;
                } else if (activeFilters.dateFin) {
                    const filterEndDate = new Date(activeFilters.dateFin);
                    // La date de fin du filtre est après ou égale à la date de début de l'élément
                    // ET la date de début de l'élément est avant ou égale à la date de fin du filtre
                    return filterEndDate >= itemStartDate && itemStartDate <= filterEndDate;
                }
            }
            
            return true;
        });
    };

    let filteredData = applyFilters(formattedData);
    
    if (searchQuery.trim() !== '') {
        filteredData = filteredData.filter(item =>
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }

    return (
        <ThemeProvider theme={createTheme()}>
            <Box sx={{ ...dynamicStyles }}>
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ marginTop: "15px" }}>
                        <h3 className="titreColore text-red" style={{ fontSize: "40px", marginRight: "8px" }}>
                            Définir les prix
                        </h3>
                        <div className="d-flex">
                            <div style={{ width: "500px", marginRight: "20px" }}>
                                <Search onSearch={handleSearch} type="search" />
                            </div>
                            <div>
                                <FontAwesomeIcon
                                    style={{ cursor: "pointer", color: "grey", fontSize: "2rem" }}
                                    onClick={printTable}
                                    icon={faPrint}
                                    className="me-2"
                                />
                                <FontAwesomeIcon
                                    style={{ cursor: "pointer", color: "red", fontSize: "2rem", marginLeft: "15px" }}
                                    onClick={exportToPDF}
                                    icon={faFilePdf}
                                />
                                <FontAwesomeIcon
                                    icon={faFileExcel}
                                    onClick={exportToExcel}
                                    style={{ cursor: "pointer", color: "green", fontSize: "2rem", marginLeft: "15px" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Composant de filtre ajouté ici */}
                   

                    <div style={{ backgroundColor: "#fff", marginTop: "2%", padding: "20px", borderRadius: "8px" }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "flex", flexDirection: "row", gap: "15px", flexWrap: "wrap" }}>
                                <Form.Group style={{ flex: 1, minWidth: "150px" }}>
                                    <Form.Label style={{ fontWeight: "bold" }}>Devise</Form.Label>
                                    <Form.Select
                                        name="devseID"
                                        value={formData.devseID}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ced4da" }}
                                    >
                                        <option value="">Sélectionner une devise</option>
                                        {devises.map(devise => (
                                            <option key={devise.id} value={devise.id}>
                                                {devise.name} ({devise.symbol})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                
                                <Form.Group style={{ flex: 1, minWidth: "150px" }}>
                                    <Form.Label style={{ fontWeight: "bold" }}>Prix d'achat</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.000001"
                                        name="prix_achat"
                                        value={formData.prix_achat}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group style={{ flex: 1, minWidth: "150px" }}>
                                    <Form.Label style={{ fontWeight: "bold" }}>Prix de vente</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.000001"
                                        name="prix_vente"
                                        value={formData.prix_vente}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group style={{ flex: 1, minWidth: "150px" }}>
                                    <Form.Label style={{ fontWeight: "bold" }}>Date de début</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date_d"
                                        value={formData.date_d}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group style={{ flex: 1, minWidth: "150px" }}>
                                    <Form.Label style={{ fontWeight: "bold" }}>Date de fin</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date_f"
                                        value={formData.date_f}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                            <Fab 
  variant="extended" 
  type="submit" 
  style={{ 
    backgroundColor: isEditing ? "#ff9800" : "#05afaa",  // #05afaa pour Définir Prix, #ff9800 (orange) pour l'édition
    color: "white",
    minWidth: "150px",
    '&:hover': {
      backgroundColor: isEditing ? "#e68a00" : "#048b87"  // Couleurs hover correspondantes
    }
  }}
>
  {isEditing ? "Mettre à jour" : "Définir Prix"}
</Fab>
                                
                                {isEditing && (
                                    <Fab 
                                        variant="extended" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditingId(null);
                                            resetForm();
                                        }} 
                                        style={{ 
                                            backgroundColor: "#f44336", 
                                            color: "white",
                                            minWidth: "150px",
                                            marginLeft: "10px"
                                        }}
                                    >
                                        Annuler
                                    </Fab>
                                )}
                            </div>
                        </form>
                    </div>
<div style={{marginTop:'3%'}}>
    <div className="d-flex justify-content-between align-items-center mb-3">
        <div style={{display:'flex', alignItems: 'center'}}>
            <h2 style={{marginBottom: 0}}>Liste des prix</h2>
            {/* Icône de filtre à côté du titre */}
            <div style={{display:'flex', alignItems: 'center'}}>
    {/* Remplacer FilterComponent.FilterIcon par une icône FontAwesome */}
    <FontAwesomeIcon
        icon={faFilter}
        onClick={() => setShowFilters(!showFilters)}
        style={{ 
            cursor: "pointer", 
            fontSize: "1.5rem", 
            marginLeft: "10px",
            color: showFilters ? "#05afaa" : "grey"
        }}
    />
</div>
        </div>
      
    </div>
    
    {/* Formulaire de filtre complet qui apparaît au clic sur l'icône */}
    <Collapse in={showFilters} sx={{ width: '100%' }}>
        <FilterComponent 
            devises={devises} 
            uniquePrixAchat={uniquePrixAchat} 
            uniquePrixVente={uniquePrixVente}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
        />
    </Collapse>
    <ExpandRTable
        columns={columns}
        data={formattedData}
        filteredData={filteredData}
        searchTerm={searchQuery}
        highlightText={highlightText}
        selectAll={selectAll}
        selectedItems={selectedItems}
        handleSelectAllChange={handleSelectAllChange}
        handleCheckboxChange={handleCheckboxChange}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleDeleteSelected={handleDeleteSelected}
        rowsPerPage={rowsPerPage}
        page={page}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        expandedRows={expandedRows}
        toggleRowExpansion={toggleRowExpansion}
        renderExpandedRow={renderExpandedRow}
    />
    
</div>

                </Box>
            </Box>
        </ThemeProvider>
    );
};

export { AddPrixForm };