import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addTransaction } from "./Actions";
import { Form, Button, Modal } from "react-bootstrap";
import Select from "react-select";
import { Fab } from "@mui/material";
import axios from "axios";
import { AddClientForm } from "./AjoutCli";
import Swal from "sweetalert2";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from "../Acceuil/Navigation";
import TablePagination from "@mui/material/TablePagination";
import "jspdf-autotable";
import Search from "../Acceuil/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from "xlsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { faTrash, faFileExcel, faPlus, faEdit, faPrint, faFilePdf, faFilter } from "@fortawesome/free-solid-svg-icons";
import '../style.css';
import { display } from "@mui/system";
import { useOpen } from "../Acceuil/OpenProvider";
import ExpandRTable from "../components/ExpandRTable";
import TableWithPagination from "./tableauTRansac";
import 'bootstrap/dist/css/bootstrap.min.css';
import TransactionFilter from './TransactionFilter';

const EchangeComponent = () => {
  const [clientsParticulier, setClientsParticulier] = useState([]);
  const [societeClients, setSocieteClients] = useState([]);
  const [devises, setDevises] = useState([]); 
  const [clientType, setClientType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [Transactions, setTransactions] = useState([]);
  const [madId, setMadId] = useState(""); // Pour stocker l'ID de MAD
  const [transaData, setTransaData] = useState({
    client_id: "",
    client_type: "",
    from_currency_id: "",
    to_currency_id: "",
    montant: "",
    montant_converti: "", // Calculé automatiquement, pas affiché à l'utilisateur
    taux_id: "",
    taux: "", // Calculé automatiquement, pas affiché à l'utilisateur
    status: "",
    use_external_api: false, // Modifié pour ne pas utiliser l'API externe
    dateTransa: new Date().toISOString().split('T')[0]
  });
  const [isExterneFormVisible, setIsExterneFormVisible] = useState(false);
  const { dynamicStyles } = useOpen();
  const { open } = useOpen();
  const [fromCurrencyLocked, setFromCurrencyLocked] = useState(false);
  const [toCurrencyLocked, setToCurrencyLocked] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    nom: '',
    prenom: '',
    cin: '',
    nationalite: '',
    code: '',
    deviseAchat: '',
    deviseVente: '',
    montant: '',
    date: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // Récupérer les clients
    axios.get("http://127.0.0.1:8000/api/clients")
    .then(response => {
      console.log('Réponse complète:', response.data);
      const allClients = response.data.client || [];
      console.log('Clients récupérés:', allClients);
      
      // Filtrer les clients particuliers (type 'P')
      const particuliers = allClients.filter(client => client.type === 'P');
      setClientsParticulier(particuliers);
      
      // Filtrer les sociétés (type 'S')
      const societes = allClients.filter(client => client.type === 'S');
      setSocieteClients(societes);
    })
    .catch(error => console.error("Erreur:", error));

    // Récupérer les devises
    axios.get("http://127.0.0.1:8000/api/devises")
      .then(response => {
        const devisesData = response.data.devises || [];
        setDevises(devisesData);
        
        // Trouver l'ID de MAD
        const madDevise = devisesData.find(d => d.code === 'MAD');
        if (madDevise) {
          setMadId(madDevise.id);
        }
        console.log("Devises récupérées:", devisesData);
      })
      .catch(error => console.error("Erreur lors de la récupération des devises:", error));

    // Récupérer les transactions
    fetchTransactions();
  }, []);

  // Gérer les changements dans les champs du formulaire
  const handleChangeTransa = (e) => {
    const { name, value } = e.target;
    
    // Pour le montant, calculer le montant converti si possible
    if (name === "montant" && transaData.taux) {
      const montantConverti = parseFloat(value) * parseFloat(transaData.taux);
      setTransaData({ 
        ...transaData, 
        [name]: value,
        montant_converti: montantConverti.toFixed(2)
      });
    } else {
      setTransaData({ ...transaData, [name]: value });
    }
  };

  // Gérer le changement de la devise d'achat (origine)
  const handleFromCurrencyChange = (selectedOption) => {
    const newFromCurrencyId = selectedOption?.value || "";
    
    if (newFromCurrencyId && newFromCurrencyId !== madId) {
      // Si la devise sélectionnée n'est pas MAD, définir la devise de vente à MAD
      setTransaData({ 
        ...transaData, 
        from_currency_id: newFromCurrencyId, 
        to_currency_id: madId 
      });
      setToCurrencyLocked(true);
      setFromCurrencyLocked(false);
    } else if (newFromCurrencyId === madId) {
      // Si MAD est sélectionné, permettre de choisir n'importe quelle devise de vente
      setTransaData({ 
        ...transaData, 
        from_currency_id: newFromCurrencyId, 
        to_currency_id: ""
      });
      setToCurrencyLocked(false);
      setFromCurrencyLocked(false);
    } else {
      // Si aucune devise n'est sélectionnée
      setTransaData({ 
        ...transaData, 
        from_currency_id: newFromCurrencyId 
      });
      setToCurrencyLocked(false);
      setFromCurrencyLocked(false);
    }
  };

  // Gérer le changement de la devise de vente (cible)
  const handleToCurrencyChange = (selectedOption) => {
    const newToCurrencyId = selectedOption?.value || "";
    
    if (newToCurrencyId && newToCurrencyId !== madId) {
      // Si la devise sélectionnée n'est pas MAD, définir la devise d'achat à MAD
      setTransaData({ 
        ...transaData, 
        to_currency_id: newToCurrencyId, 
        from_currency_id: madId 
      });
      setFromCurrencyLocked(true);
      setToCurrencyLocked(false);
    } else if (newToCurrencyId === madId) {
      // Si MAD est sélectionné, permettre de choisir n'importe quelle devise d'achat
      setTransaData({ 
        ...transaData, 
        to_currency_id: newToCurrencyId, 
        from_currency_id: ""
      });
      setFromCurrencyLocked(false);
      setToCurrencyLocked(false);
    } else {
      // Si aucune devise n'est sélectionnée
      setTransaData({ 
        ...transaData, 
        to_currency_id: newToCurrencyId 
      });
      setFromCurrencyLocked(false);
      setToCurrencyLocked(false);
    }
  };

  useEffect(() => {
    if (transaData.from_currency_id && transaData.to_currency_id && transaData.dateTransa) {
      // Déterminer si c'est un achat ou une vente par rapport à MAD
      const isAchat = transaData.from_currency_id !== madId && transaData.to_currency_id === madId;
      const isVente = transaData.from_currency_id === madId && transaData.to_currency_id !== madId;
      
      // On récupère la devise dont on a besoin du taux (autre que MAD)
      const deviseId = isAchat ? transaData.from_currency_id : transaData.to_currency_id;
      
      console.log("DeviseId recherchée:", deviseId);
      console.log("Date transaction:", transaData.dateTransa);
      
      // Récupérer les taux de change depuis la table define_prix
      axios.get('http://127.0.0.1:8000/api/definit_prix')
        .then(response => {
          console.log("Réponse complète des prix:", response.data);
          
          // Vérifier si la réponse contient des données
          const prixData = response.data.definiePrix || response.data.definie_prix || [];
          
          if (prixData.length === 0) {
            console.warn("Aucun prix disponible dans la réponse.");
            Swal.fire({
              icon: "error",
              title: "Erreur",
              text: "Aucun prix n'est disponible dans le système.",
            });
            return;
          }
          
          // Filtrer les prix pour la devise recherchée
          const prixPourDevise = prixData.filter(p => {
            const deviseIdMatches = 
              (p.devise_id && p.devise_id == deviseId) ||
              (p.devise_i_d && p.devise_i_d.id == deviseId) ||
              (p.devseID && p.devseID == deviseId) ||
              (p.devise && p.devise.id == deviseId);
            
            return deviseIdMatches;
          });
          
          console.log("Prix trouvés pour cette devise:", prixPourDevise);
          
          if (prixPourDevise.length === 0) {
            console.warn(`Aucun prix trouvé pour la devise ID: ${deviseId}`);
            
            // Récupérer le nom de la devise pour l'afficher dans le message d'erreur
            const deviseNom = devises.find(d => d.id == deviseId)?.name || 'Cette devise';
            
            Swal.fire({
              icon: "error",
              title: "Erreur de devise",
              text: `${deviseNom} n'a pas de taux de change défini dans le système. Veuillez contacter l'administrateur pour ajouter ce taux.`,
            });
            
            // Réinitialiser les valeurs de devises sélectionnées
            setTransaData(prevState => ({
              ...prevState,
              taux: "",
              montant_converti: ""
            }));
            
            return;
          }
          
          // Le reste du code existant pour les prix valides reste inchangé
          const dateTransa = new Date(transaData.dateTransa);
          const prixValidesPourDate = prixPourDevise.filter(p => {
            const dateDebut = new Date(p.date_debut || p.date_d);
            const dateFin = new Date(p.date_fin || p.date_f);
            
            return dateTransa >= dateDebut && dateTransa <= dateFin;
          });
          
          if (prixValidesPourDate.length > 0) {
            // Code existant pour traiter les prix valides
            const prixRecent = prixValidesPourDate.reduce((recent, current) => {
              const dateDebutRecent = new Date(recent.date_debut || recent.date_d);
              const dateDebutCurrent = new Date(current.date_debut || current.date_d);
              return dateDebutCurrent > dateDebutRecent ? current : recent;
            });
            
            const prixAchat = prixRecent.prix_achat || prixRecent.prix_a || 0;
            const prixVente = prixRecent.prix_vente || prixRecent.prix_v || 0;
            const tauxApplique = isAchat ? parseFloat(prixAchat) : parseFloat(prixVente);
            
            const montantConverti = transaData.montant 
              ? (parseFloat(transaData.montant) * tauxApplique).toFixed(2)
              : "";
            
            setTransaData(prevState => ({
              ...prevState,
              taux_id: prixRecent.id,
              taux: tauxApplique.toString(),
              montant_converti: montantConverti
            }));
          } else {
            console.warn("Aucun prix valide pour cette date.");
            
            // Récupérer le nom de la devise pour l'afficher dans le message d'erreur
            const deviseNom = devises.find(d => d.id == deviseId)?.name || 'Cette devise';
            
            Swal.fire({
              icon: "warning",
              title: "Attention",
              text: `${deviseNom} n'a pas de taux de change défini pour la date ${transaData.dateTransa}. Veuillez sélectionner une autre date ou contacter l'administrateur.`,
            });
            
            // Réinitialiser les valeurs de taux et montant converti
            setTransaData(prevState => ({
              ...prevState,
              taux: "",
              montant_converti: ""
            }));
          }
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des taux de change:", error);
          Swal.fire({
            icon: "error",
            title: "Erreur",
            text: "Une erreur est survenue lors de la récupération des taux de change.",
          });
        });
    }
  }, [transaData.from_currency_id, transaData.to_currency_id, transaData.dateTransa, madId, devises]);

  // Recalculer le montant converti lorsque le montant change
  useEffect(() => {
    if (transaData.montant && transaData.taux) {
      const montantConverti = parseFloat(transaData.montant) * parseFloat(transaData.taux);
      setTransaData(prevState => ({
        ...prevState,
        montant_converti: montantConverti.toFixed(2)
      }));
    }
  }, [transaData.montant, transaData.taux]);

  const handleClientTypeChange = (e) => {
    const { value } = e.target;
    if (value === clientType) {
      // Si même valeur, désélectionner
      setClientType("");
      setTransaData({ ...transaData, client_type: "", client_id: "" });
      setIsExterneFormVisible(false);
    } else {
      setClientType(value);
      setTransaData({ ...transaData, client_type: value, client_id: "" });
  
      if (value === "externe") {
        setIsExterneFormVisible(true);
      } else {
        setIsExterneFormVisible(false);
      }
    }
  };

  const resetForm = () => {
    setTransaData({
      client_id: "",
      client_type: "",
      from_currency_id: "",
      to_currency_id: "",
      montant: "",
      montant_converti: "",
      taux_id: "",
      taux: "",
      status: "",
      use_external_api: false,
      dateTransa: new Date().toISOString().split('T')[0]
    });
    setClientType("");
    setFromCurrencyLocked(false);
    setToCurrencyLocked(false);
    setIsExterneFormVisible(false);
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Données avant soumission:", transaData);

    // Vérifier que les données nécessaires sont présentes
    if (!transaData.client_id || !transaData.from_currency_id || !transaData.to_currency_id || 
        !transaData.montant || !transaData.taux_id || !transaData.taux) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    // Utiliser axios pour soumettre la transaction
    axios.post("http://127.0.0.1:8000/api/transaction", transaData)
      .then(response => {
        console.log("Transaction ajoutée:", response.data);
        
        // Afficher un message de succès
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Transaction ajoutée avec succès.",
        });
        
        // Réinitialiser le formulaire
        resetForm();
        
        // Récupérer les transactions mises à jour
        fetchTransactions();
      })
      .catch(error => {
        console.error("Erreur lors de l'ajout de la transaction:", error);
        
        // Afficher un message d'erreur
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Une erreur est survenue lors de l'ajout de la transaction.",
        });
      });
  };

  const fetchTransactions = () => {
    axios.get("http://127.0.0.1:8000/api/transaction")
      .then(response => {
        console.log("Transactions mises à jour:", response.data);
        
        // Mettre à jour l'état des transactions avec les nouvelles données
        const transac = response.data.transactions || [];
        setTransactions(transac);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des transactions:", error);
      });
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, 'transactions_table.xlsx');
  };
  

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des Transactions', 14, 16);
    doc.autoTable({
      head: [['ID', 'Client', 'Devise Achat', 'Devise Vente', 'Montant', 'Taux', 'Montant Converti', 'Status', 'Date']],
      body: formattedData.map(transaction => [
        transaction.id, 
        transaction.nom_cli || transaction.raison_social, 
        transaction.from_currency, 
        transaction.to_currency, 
        transaction.montant, 
        transaction.taux, 
        transaction.montant_converti, 
        transaction.status, 
        transaction.date
      ]),
      startY: 20,
      theme: 'grid'
    });
    doc.save('transactions_table.pdf');
  };

  const printTable = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des Transactions</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Liste des Transactions</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Devise Achat</th>
                <th>Devise Vente</th>
                <th>Montant</th>
                <th>Taux</th>
                <th>Montant Converti</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${formattedData.map(transaction => `
                <tr>
                  <td>${transaction.id}</td>
                  <td>${transaction.nom_cli || transaction.raison_social || 'N/A'}</td>
                  <td>${transaction.from_currency}</td>
                  <td>${transaction.to_currency}</td>
                  <td>${transaction.montant}</td>
                  <td>${transaction.taux}</td>
                  <td>${transaction.montant_converti}</td>
                  <td>${transaction.status}</td>
                  <td>${transaction.date}</td>
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
 
  const columns = [
    { key: "nom_cli", label: "Nom client", minWidth: 100 },
    { key: "prenom_cli", label: "Prenom client", minWidth: 100 },
    { key: "CIN", label: "CIN", minWidth: 100 },
    { key: "natinalite", label: "Nationalite", minWidth: 100 },
    { key: "Code_client", label: "Code", minWidth: 100 },
    { key: "raison_social", label: "Raison social", minWidth: 100 },
    { key: "from_currency", label: "Devise Achat", minWidth: 100 },
    { key: "to_currency", label: "Devise Vente", minWidth: 100 },
    { key: "montant", label: "Montant", minWidth: 100 },
    { key: "taux", label: "Taux", minWidth: 100 },
    { key: "montant_converti", label: "Montant Converti", minWidth: 100 },
    { key: "status", label: "Statut", minWidth: 100 },
    { key: "type", label: "type client", minWidth: 100 },
    { key: "date", label: "Date ", minWidth: 100 }
  ];

  const formattedData = Transactions.map((transaction) => {
    return {
        id: transaction.id,
        nom_cli: transaction.client?.nom || '',
        prenom_cli: transaction.client?.prenom|| '',
        CIN: transaction.client?.cin || '',
        natinalite: transaction.client?.nationalite || '',
        Code_client: transaction.client?.CodeClient || '',
        raison_social: transaction.client?.raison_sociale || '',
        from_currency: transaction.from_currency?.code || '',
        to_currency: transaction.to_currency?.code || '',
        montant: transaction.montant,
        taux: transaction.taux,
        montant_converti: transaction.montant_converti || transaction.montant_convirtir || '', 
        status: transaction.status,
        type: transaction.client_type,
        date: transaction.dateTransa
    };
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilter = () => {
    return Transactions.filter(transaction => {
      const client = transaction.client || {};
  return (
        (!filterValues.nom || client.nom?.toLowerCase().includes(filterValues.nom.toLowerCase())) &&
        (!filterValues.prenom || client.prenom?.toLowerCase().includes(filterValues.prenom.toLowerCase())) &&
        (!filterValues.cin || client.cin?.toLowerCase().includes(filterValues.cin.toLowerCase())) &&
        (!filterValues.nationalite || client.nationalite?.toLowerCase().includes(filterValues.nationalite.toLowerCase())) &&
        (!filterValues.code || client.CodeClient?.toLowerCase().includes(filterValues.code.toLowerCase())) &&
        (!filterValues.deviseAchat || transaction.from_currency?.code?.toLowerCase().includes(filterValues.deviseAchat.toLowerCase())) &&
        (!filterValues.deviseVente || transaction.to_currency?.code?.toLowerCase().includes(filterValues.deviseVente.toLowerCase())) &&
        (!filterValues.montant || transaction.montant?.toString().includes(filterValues.montant)) &&
        (!filterValues.date || transaction.dateTransa?.includes(filterValues.date))
      );
    });
  };

// utils/highlight.js
const highlightText = (text, searchTerm) => {
  if (!text || !searchTerm) return text || ''; // <-- protège contre undefined/null
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.toString().split(regex).map((part, i) =>
    regex.test(part) ? <span key={i} style={{ backgroundColor: 'yellow' }}>{part}</span> : part
  );
};



// Fonction de filtrage modifiée qui retourne aussi les textes surlignés
const filteredTransactions = applyFilter().filter(transaction => {
  const client = transaction.client || {};
  
  // Liste des champs à vérifier
  const fieldsToCheck = [
    { key: 'nom', value: client.nom },
    { key: 'prenom', value: client.prenom },
    { key: 'cin', value: client.cin },
    { key: 'devise source', value: transaction.from_currency?.code },
    { key: 'devise cible', value: transaction.to_currency?.code },
    { key: 'montant', value: transaction.montant?.toString() },
    { key: 'statut', value: transaction.status },
    { key: 'nationalité', value: client.nationalite },
    { key: 'code client', value: client.CodeClient },
    { key: 'taux', value: transaction.taux?.toString() },
    { key: 'montant converti', value: transaction.montant_convirtir?.toString() },
    { key: 'type client', value: transaction.client_type },
    { key: 'date', value: transaction.dateTransa }
  ];
  
  // Créer le texte combiné pour la recherche globale
  const searchFields = fieldsToCheck
    .filter(field => field.value)
    .map(field => field.value)
    .join(" ")
    .toLowerCase();
  
  // Vérifier si la recherche correspond et retourner directement le résultat
  return searchTerm === "" || searchFields.includes(searchTerm.toLowerCase());
});


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllChange = (event) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      setSelectedItems(filteredTransactions.map(transaction => transaction.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://127.0.0.1:8000/api/transaction/${id}`)
          .then(() => {
            Swal.fire(
              'Supprimé!',
              'La transaction a été supprimée.',
              'success'
            );
            fetchTransactions();
          })
          .catch(error => {
            console.error('Erreur lors de la suppression:', error);
            Swal.fire(
              'Erreur!',
              'Une erreur est survenue lors de la suppression.',
              'error'
            );
          });
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous allez supprimer ${selectedItems.length} transaction(s)!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!'
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(selectedItems.map(id => 
          axios.delete(`http://127.0.0.1:8000/api/transaction/${id}`)
        ))
        .then(() => {
          Swal.fire(
            'Supprimé!',
            'Les transactions ont été supprimées.',
            'success'
          );
          setSelectedItems([]);
          setSelectAll(false);
          fetchTransactions();
        })
        .catch(error => {
          console.error('Erreur lors de la suppression:', error);
          Swal.fire(
            'Erreur!',
            'Une erreur est survenue lors de la suppression.',
            'error'
          );
        });
      }
    });
  };

  return (
      <ThemeProvider theme={createTheme()}>
        <Box sx={{ ...dynamicStyles }}>
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ marginTop: "15px" }}
            >
              <h3
                className="titreColore text-red"
                style={{ fontSize: "40px", marginRight: "8px" }}
              >
                Échange
              </h3>
              <div className="d-flex">
                <div style={{ width: "500px", marginRight: "20px" }}>
                  <Search onSearch={handleSearch} type="search" />
                </div>

                <div>
                  <FontAwesomeIcon
                    style={{
                      cursor: "pointer",
                      color: "grey",
                      fontSize: "2rem",
                    }}
                    onClick={printTable}
                    icon={faPrint}
                    className="me-2"
                  />
                  <FontAwesomeIcon
                    style={{
                      cursor: "pointer",
                      color: "red",
                      fontSize: "2rem",
                      marginLeft: "15px",
                    }}
                    onClick={exportToPDF}
                    icon={faFilePdf}
                  />

                  <FontAwesomeIcon
                    icon={faFileExcel}
                    onClick={exportToExcel}
                    style={{
                      cursor: "pointer",
                      color: "green",
                      fontSize: "2rem",
                      marginLeft: "15px",
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ 
  backgroundColor: "#fff",
  marginTop: "2%",
  padding: "20px",
  display: "flex",
  borderRadius: "8px",
  width: "100%",
  transition: "width 0.3s ease"
}}>
  <form onSubmit={handleSubmit} style={{ width: "100%" }}>
    {/* Tous les éléments alignés sur une seule ligne horizontale */}
    <div style={{ 
      display: "flex", 
      width: "100%", 
      flexDirection: "row", 
      alignItems: "flex-end", 
      gap: "15px", 
      flexWrap: "nowrap"
    }}>
      {/* Devise Achat */}
      <div style={{ minWidth: "200px" }}>
        <Form.Label>Achat</Form.Label>
        <Select
          value={devises.find(d => d.id === transaData.from_currency_id) ? {
            value: transaData.from_currency_id,
            label: devises.find(d => d.id === transaData.from_currency_id)?.name,
          } : null}
          onChange={handleFromCurrencyChange}
          options={devises.map(d => ({ value: d.id, label: d.name }))}
          isSearchable
          isDisabled={fromCurrencyLocked}
          isClearable={true}
        />
      </div>

      {/* Bouton de switch */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 5px", marginBottom: "8px" }}>
        <button
          type="button"
          style={{
            border: "none",
            backgroundColor: "#f0f0f0",
            padding: "5px 8px",
            height: "38px",
            cursor: fromCurrencyLocked || toCurrencyLocked ? "not-allowed" : "pointer",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            opacity: fromCurrencyLocked || toCurrencyLocked ? 0.5 : 1
          }}
          onClick={() => {
            if (!fromCurrencyLocked && !toCurrencyLocked) {
              setTransaData({
                ...transaData,
                from_currency_id: transaData.to_currency_id,
                to_currency_id: transaData.from_currency_id
              });
            }
          }}
          disabled={fromCurrencyLocked || toCurrencyLocked}
        >
          ← →
        </button>
      </div>

      {/* Devise Vente */}
      <div style={{ minWidth: "200px" }}>
        <Form.Label>Vente</Form.Label>
        <Select
          value={devises.find(d => d.id === transaData.to_currency_id) ? {
            value: transaData.to_currency_id,
            label: devises.find(d => d.id === transaData.to_currency_id)?.name,
          } : null}
          onChange={handleToCurrencyChange}
          options={devises.map(d => ({ value: d.id, label: d.name }))}
          isSearchable
          isDisabled={toCurrencyLocked}
          isClearable={true}
        />
      </div>

      {/* Montant */}
      <div style={{ minWidth: "110px" }}>
        <Form.Label>Montant</Form.Label>
        <Form.Control
          type="number"
          name="montant"
          value={transaData.montant}
          onChange={handleChangeTransa}
          required
        />
      </div>

      {/* Montant Converti */}
      <div style={{ minWidth: "110px" }}>
        <Form.Label>Montant Converti</Form.Label>
        <Form.Control
          type="text"
          name="montant_converti"
          value={transaData.montant_converti}
          readOnly
          style={{ backgroundColor: "#f5f5f5" }}
        />
      </div>

      {/* Status */}
      <div style={{ minWidth: "100px" }}>
        <Form.Label>Status</Form.Label>
        <Form.Control
          type="text"
          name="status"
          value={transaData.status}
          onChange={handleChangeTransa}
          required
        />
      </div>

      {/* Date */}
      <div style={{ minWidth: "140px" }}>
        <Form.Label>Date</Form.Label>
        <Form.Control
          type="date"
          name="dateTransa"
          value={transaData.dateTransa}
          onChange={handleChangeTransa}
          required
        />
      </div>

      {/* Type de client */}
      <div style={{ minWidth: "280px" }}>
        <Form.Label>Type de Client</Form.Label>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Option Société */}
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "5px 8px",
              border: clientType === "societe" ? "1px solid #007bff" : "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: clientType === "societe" ? "#e6f2ff" : "transparent",
              cursor: "pointer"
            }}
            onClick={() => handleClientTypeChange({ target: { value: "societe" } })}
          >
            <div 
              style={{ 
                width: "16px", 
                height: "16px", 
                borderRadius: "50%", 
                border: "2px solid #007bff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "4px" 
              }}
            >
              {clientType === "societe" && (
                <div 
                  style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    backgroundColor: "#007bff" 
                  }}
                />
              )}
            </div>
            <span>Société</span>
          </div>
          
          {/* Option Particulier */}
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "5px 8px",
              border: clientType === "particulier" ? "1px solid #007bff" : "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: clientType === "particulier" ? "#e6f2ff" : "transparent",
              cursor: "pointer"
            }}
            onClick={() => handleClientTypeChange({ target: { value: "particulier" } })}
          >
            <div 
              style={{ 
                width: "16px", 
                height: "16px", 
                borderRadius: "50%", 
                border: "2px solid #007bff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "4px" 
              }}
            >
              {clientType === "particulier" && (
                <div 
                  style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    backgroundColor: "#007bff" 
                  }}
                />
              )}
            </div>
            <span>Particulier</span>
          </div>
          
          {/* Option Externe */}
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              padding: "5px 8px",
              border: clientType === "externe" ? "1px solid #007bff" : "1px solid #ddd",
              borderRadius: "5px",
              backgroundColor: clientType === "externe" ? "#e6f2ff" : "transparent",
              cursor: "pointer"
            }}
            onClick={() => handleClientTypeChange({ target: { value: "externe" } })}
          >
            <div 
              style={{ 
                width: "16px", 
                height: "16px", 
                borderRadius: "50%", 
                border: "2px solid #007bff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "4px" 
              }}
            >
              {clientType === "externe" && (
                <div 
                  style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    backgroundColor: "#007bff" 
                  }}
                />
              )}
            </div>
            <span>Externe</span>
          </div>
        </div>
      </div>
    </div>

    {/* Client selection - s'affiche uniquement quand un type est sélectionné */}
    {clientType && (
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        width: "100%", 
        marginTop: "20px" 
      }}>
        {clientType === "particulier" ? (
          <>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <Form.Label>CIN / Code Client</Form.Label>
              <Select
                value={clientsParticulier.find(c => c.id === transaData.client_id) ? {
                  value: transaData.client_id,
                  label: clientsParticulier.find(c => c.id === transaData.client_id)?.cin +
                    " / " +
                    clientsParticulier.find(c => c.id === transaData.client_id)?.CodeClient,
                } : null}
                onChange={(selectedOption) => setTransaData({ ...transaData, client_id: selectedOption?.value || "" })}
                options={clientsParticulier.map(c => ({ value: c.id, label: `${c.cin} / ${c.CodeClient}` }))}
                placeholder="Sélectionner CIN / Code Client"
                isSearchable
              />
            </div>

            <div style={{ flex: "1", minWidth: "200px" }}>
              <Form.Label>Nom & Prénom</Form.Label>
              <Select
                value={clientsParticulier.find(c => c.id === transaData.client_id) ? {
                  value: transaData.client_id,
                  label: clientsParticulier.find(c => c.id === transaData.client_id)?.nom + " " + clientsParticulier.find(c => c.id === transaData.client_id)?.prenom,
                } : null}
                options={clientsParticulier.map(c => ({ value: c.id, label: `${c.name} ${c.prenom}` }))}
                placeholder="Nom & Prénom"
                isSearchable
              />
            </div>
          </>
        ) : clientType === "societe" ? (
          <>
            <div style={{ flex: "1", minWidth: "200px" }}>
              <Form.Label>Raison Sociale</Form.Label>
              <Select
                value={societeClients.find(c => c.id === transaData.client_id) ? {
                  value: transaData.client_id,
                  label: societeClients.find(c => c.id === transaData.client_id)?.raison_sociale,
                } : null}
                onChange={(selectedOption) => setTransaData({ ...transaData, client_id: selectedOption?.value || "" })}
                options={societeClients.map(c => ({ value: c.id, label: c.raison_sociale }))}
                placeholder="Sélectionner Raison Sociale"
                isSearchable
              />
            </div>

            <div style={{ flex: "1", minWidth: "200px" }}>
              <Form.Label>Code Client</Form.Label>
              <Select
                value={societeClients.find(c => c.id === transaData.client_id) ? {
                  value: transaData.client_id,
                  label: societeClients.find(c => c.id === transaData.client_id)?.CodeClient,
                } : null}
                options={societeClients.map(c => ({ value: c.id, label: c.CodeClient }))}
                placeholder="Code Client"
                isSearchable
              />
            </div>
          </>
        ) : null}
      </div>
    )}
    
    {/* Formulaire d'ajout client externe */}
    {clientType === "externe" && (
      <div style={{ width: "100%" }}>
        <AddClientForm 
          type="E" 
          onClientAdded={(clientId) => {
            setTransaData({ ...transaData, client_id: clientId });
          }} 
        />
      </div>
    )}
    
    {/* Bouton d'échange repositionné en bas au milieu */}
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      width: "100%", 
      marginTop: "30px" 
    }}>
      <Fab 
        variant="extended" 
        className="btn-sm Fab" 
        type="submit"
        style={{ height: "38px" }}
      >
        Échange
      </Fab>
    </div>
  </form>
</div>

              <div style={{marginTop:'3%'}}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
      <h2>Liste des Transactions</h2>
              <FontAwesomeIcon
                icon={faFilter}
                onClick={() => setShowFilter(!showFilter)}
                style={{
                  cursor: 'pointer',
                  color: showFilter ? '#05afaa' : 'gray',
                  fontSize: '1.5rem',
                  marginLeft: '10px'
                }}
/>
      </div>

            {showFilter && (
              <TransactionFilter 
                filterValues={filterValues}
                onFilterChange={handleFilterChange}
              />
            )}

            <ExpandRTable
              columns={columns}
              data={formattedData}
              filteredData={filteredTransactions.map(transaction => ({
                id: transaction.id,
                nom_cli: transaction.client?.nom || '',
                prenom_cli: transaction.client?.prenom || '',
                CIN: transaction.client?.cin || '',
                natinalite: transaction.client?.nationalite || '',
                Code_client: transaction.client?.CodeClient || '',
                raison_social: transaction.client?.raison_sociale || '',
                from_currency: transaction.from_currency?.code || '',
                to_currency: transaction.to_currency?.code || '',
                montant: transaction.montant,
                taux: transaction.taux,
                montant_converti: transaction.montant_converti || transaction.montant_convirtir || '',
                status: transaction.status,
                date: transaction.dateTransa
              }))}
              searchTerm={searchTerm} 
  highlightText={highlightText}
              
              selectAll={selectAll}
              selectedItems={selectedItems}
              handleSelectAllChange={handleSelectAllChange}
              handleCheckboxChange={handleCheckboxChange}
              handleDelete={handleDelete}
              handleDeleteSelected={handleDeleteSelected}
              rowsPerPage={rowsPerPage}
              page={page}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              expandedRows={{}}
              toggleRowExpansion={() => {}}
              renderExpandedRow={() => null}
            />
          </div>
          </Box>
        </Box>
      </ThemeProvider>
  );
};

export { EchangeComponent };