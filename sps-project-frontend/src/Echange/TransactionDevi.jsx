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
import { faTrash, faFileExcel, faPlus, faEdit, faPrint, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import '../style.css';
import { display } from "@mui/system";
import { useOpen } from "../Acceuil/OpenProvider";
import ExpandRTable from "../components/ExpandRTable";
import TableWithPagination from "./tableauTRansac";

const AddTransactionForm = () => {
  const [clientsParticulier, setClientsParticulier] = useState([]);
  const [societeClients, setSocieteClients] = useState([]);
  const [devises, setDevises] = useState([]); // Nouvel état pour les devises
  const [clientType, setClientType] = useState("");
  const [sourceTaux, setsourceTaux] = useState("");
  const [fromCurrencyLocked, setFromCurrencyLocked] = useState(false);
  const [toCurrencyLocked, setToCurrencyLocked] = useState(false);
const [clientExterneData, setClientExterneData] = useState(null);
  const [isClientExterneValid, setIsClientExterneValid] = useState(false);
    const [showRecap, setShowRecap] = useState(false);
  const [Transactions, setTransactions] = useState([]);
  const [transaData, setTransaData] = useState({
    client_id: "",
    client_type: "",
    from_currency_id: "",
    to_currency_id: "",
    montant: "",
    taux_id: "",
    taux: "", // Ajoutez cette propriété
    status: "Transférer",
    use_external_api: true,
    dateTransa: new Date().toISOString().split('T')[0]
  });
  const [isExterneFormVisible, setIsExterneFormVisible] = useState(false);
  const { dynamicStyles } = useOpen();
  const { open } = useOpen();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    
    axios.get("http://127.0.0.1:8000/api/clients")
    .then(response => {
      console.log('Réponse complète:', response.data);
      const allClients = response.data.client || []; // Notez "client" au singulier
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
        setDevises(response.data.devises || []);
        console.log(response.data)
      })
      .catch(error => console.error("Erreur lors de la récupération des devises:", error));
      //recuperer les transaction:
      axios.get("http://127.0.0.1:8000/api/transactionapi")
      .then(response => {
        console.log("Full API response:", response.data);
        
        // Check if the expected property exists
        if (response.data.transactioApi) {
          setTransactions(response.data.transactioApi);
          console.log("Transactions loaded:", response.data.transactioApi);
        } else {
          console.error("Property 'transactioApi' not found in response:", response.data);
          // Set empty array as fallback
          setTransactions([]);
        }
      })
      .catch(error => console.error("Erreur lors de la récupération des transactions:", error));
      
    }, []);

  const handleChangeTransa = (e) => {
    const { name, value } = e.target;
    setTransaData({ ...transaData, [name]: value });
  };

useEffect(() => {
  if (transaData.from_currency_id && transaData.to_currency_id) {
    axios.get('http://127.0.0.1:8000/api/prixApi')
      .then(response => {

        // Vérifiez la structure de la réponse et extrayez les données correctement
        const tauxData = response.data.prix_par_apis || response.data.data || [];
        console.log("Dataaaaaaaaaaaaaaaaaaaaaaa", response.data);

        if (tauxData.length === 0) {
          console.warn("Aucun taux de change disponible.");
          setTransaData(prevState => ({
            ...prevState,
            taux_id: "", 
          }));
          return;
        }

        console.log("From currency ID:", transaData.from_currency_id);
        console.log("To currency ID:", transaData.to_currency_id);
        console.log("Taux disponibles:", tauxData);

        // Regardons la structure du premier élément pour mieux comprendre les données
        if (tauxData.length > 0) {
          console.log("Structure d'un élément taux:", tauxData[0]);
        }

        // Amélioration de la comparaison des devises
        const tauxCorrespondant = tauxData.find(t => {
          try {
            // Vérifiez que devise_achat et devise_vente existent et ont un id
            if (!t.devise_achat || !t.devise_vente) {
              return false;
            }
            
            // Vérifiez les types et convertissez en chaînes pour une comparaison cohérente
            const fromCurrencyMatch = String(t.devise_achat.id) === String(transaData.from_currency_id);
            const toCurrencyMatch = String(t.devise_vente.id) === String(transaData.to_currency_id);
            
            // Logs pour déboguer
            if (fromCurrencyMatch && toCurrencyMatch) {
              console.log("Taux correspondant trouvé:", t);
            }
            
            return fromCurrencyMatch && toCurrencyMatch;
          } catch (error) {
            console.error("Erreur lors de la comparaison des devises:", error);
            return false;
          }
        });

        if (tauxCorrespondant) {
          console.log("Taux trouvé :", tauxCorrespondant);
          setTransaData(prevState => ({
            ...prevState,
            taux_id: tauxCorrespondant.id,
            taux: tauxCorrespondant.taux, // Ajoutez cette ligne
            montant_converti: prevState.montant * tauxCorrespondant.taux
          }));
        } else {
          // Vérifiez si un taux inverse existe
          const tauxInverse = tauxData.find(t => {
            try {
              // Vérifiez que devise_achat et devise_vente existent et ont un id
              if (!t.devise_achat || !t.devise_vente) {
                return false;
              }
              
              // Correction ici: comparaison des IDs, pas des codes
              return String(t.devise_achat.id) === String(transaData.to_currency_id) && 
                     String(t.devise_vente.id) === String(transaData.from_currency_id);
            } catch (error) {
              console.error("Erreur lors de la comparaison des devises inverses:", error);
              return false;
            }
          });
          
          if (tauxInverse) {
            console.log("Taux inverse trouvé:", tauxInverse);
            const tauxCalcule = 1 / tauxInverse.taux;
            setTransaData(prevState => ({
              ...prevState,
              taux_id: tauxInverse.id,
              taux: tauxCalcule, // Ajoutez cette ligne
              montant_converti: prevState.montant * tauxCalcule
            }));
          } else {
            // Dernier recours: essayer de trouver un taux par code (si disponible)
            // Cette partie est optionnelle selon la structure de vos données
            
            Swal.fire({
              icon: 'warning',
              title: 'Attention',
              text: 'Aucun taux disponible pour cette paire de devises. Veuillez vérifier votre sélection.'
            });
            setTransaData(prevState => ({
              ...prevState,
              taux_id: "",
              taux: "", // Ajoutez cette ligne
              montant_converti: ""
            }));
          }
        }
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des taux de change :", error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de récupérer les taux de change'
        });
      });
  }
}, [transaData.from_currency_id, transaData.to_currency_id, transaData.montant]);

  
  const handleClientTypeChange = (e) => {
    const { value } = e.target;
    setClientType(value);
    setTransaData({ ...transaData, client_type: value, client_id: "" });

    if (value === "externe") {
      setIsExterneFormVisible(true);
    } else {
      setIsExterneFormVisible(false);
    }
  };

  const handleClientExterneData = (data) => {
    setClientExterneData(data);
    
    // Vérifier si les données du client externe sont valides
    const requiredFields = ['nom', 'prenom', 'cin', 'nationalite','CodeClient'];
    const isValid = requiredFields.every(field => data[field] && data[field].trim() !== '');
    setIsClientExterneValid(isValid);
  };
 // Update the handleSubmit function in your AddTransactionForm component
  const handleSubmit = (e) => {
     e.preventDefault();
   
     // Validation spécifique selon le type de client
     if (clientType === "externe") {
      if (!isClientExterneValid) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Veuillez remplir tous les champs obligatoires du client externe."
        });
        return;
      }
      
      // Vérifiez également les champs de transaction
      if (!transaData.from_currency_id || !transaData.to_currency_id ||
          !transaData.montant || !transaData.taux_id) { // Retirez la vérification de taux car c'est déjà vérifié par taux_id
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Veuillez remplir tous les champs obligatoires de la transaction."
        });
        return;
      }
    } else {
      // Pour les clients existants (particulier ou société)
      if (!transaData.client_id || !transaData.from_currency_id || !transaData.to_currency_id ||
          !transaData.montant || !transaData.taux_id) { // Retirez la vérification de taux ici aussi
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Veuillez remplir tous les champs obligatoires."
        });
        return;
      }
    }
   
     setShowRecap(true);
   };
 
   const handleConfirmTransaction = () => {
     if (clientType === "externe" && clientExterneData) {
       // Assurez-vous que les données du client externe sont complètes
       const clientData = {
         ...clientExterneData,
         type: "E"  // E pour externe
       };
       
       axios.post("http://127.0.0.1:8000/api/clients", clientData)
         .then(res => {
           const clientId = res.data.client.id;
           // Log pour debug
           console.log("Client externe ajouté avec ID:", clientId);
           submitTransaction(clientId);
         })
         .catch(error => {
           console.error("Erreur lors de l'ajout du client externe:", error);
           Swal.fire({
             icon: "error",
             title: "Erreur",
             text: "Erreur lors de l'ajout du client externe: " + (error.response?.data?.message || error.message)
           });
         });
     } else {
       submitTransaction(transaData.client_id);
     }
     setShowRecap(false);
   };

   const submitTransaction = (clientId) => {
    const tauxId = transaData.taux_id ? parseInt(transaData.taux_id) : null;
  
    if (!tauxId || isNaN(tauxId)) {
      Swal.fire("Erreur", "Taux ID manquant ou invalide", "error");
      return;
    }
  
    const payload = {
      ...transaData,
      client_id: clientId,
      taux_id: tauxId
    };
  
    console.log("Payload envoyé à Laravel :", JSON.stringify(payload, null, 2));

  
    axios.post("http://127.0.0.1:8000/api/transactionapi", payload)
      .then(() => {
        Swal.fire("Succès", "Transaction enregistrée", "success");
        resetForm();
      })
      .catch(error => {
        console.error("Erreur transaction:", error);
        console.log("Réponse Laravel:", error.response?.data);
        Swal.fire("Erreur", error.response?.data?.message || "Erreur inconnue", "error");
      });
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
      status: "Transférer",
      use_external_api: false,
      dateTransa: new Date().toISOString().split('T')[0]
    });
    setClientType("");
    setFromCurrencyLocked(false);
    setToCurrencyLocked(false);
    setIsExterneFormVisible(false);
  };

  const fetchTransactions = () => {
    axios.get("http://127.0.0.1:8000/api/transactionapi") // ou /transactions selon ton route
      .then(res => {
        console.log("Transactions récupérées jjjjjjjjjjjjjjj:", res.data);
        // adapte selon la structure exacte
        setTransactions(res.data.transactions || res.data || []);
      })
      .catch(err => {
        console.error("Erreur lors du chargement des transactions:", err);
      });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = Transactions.filter(transaction => {
      const searchLower = query.toLowerCase();
      return (
        (transaction.client?.nom?.toLowerCase().includes(searchLower) || '') ||
        (transaction.client?.prenom?.toLowerCase().includes(searchLower) || '') ||
        (transaction.client?.cin?.toLowerCase().includes(searchLower) || '') ||
        (transaction.client?.CodeClient?.toLowerCase().includes(searchLower) || '') ||
        (transaction.from_currency?.code?.toLowerCase().includes(searchLower) || '') ||
        (transaction.to_currency?.code?.toLowerCase().includes(searchLower) || '') ||
        (transaction.status?.toLowerCase().includes(searchLower) || '') ||
        (transaction.dateTransa?.toLowerCase().includes(searchLower) || '')
      );
    });
    setFilteredTransactions(filtered);
  };

  const exportToExcel = () => {
    const table = document.getElementById('articlesTable');
    const workbook = XLSX.utils.table_to_book(table, { sheet: 'Articles' });
    XLSX.writeFile(workbook, 'articles_table.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des Articles', 14, 16);
    doc.autoTable({
      head: [['ID', 'Titre', 'Description', 'Prix']],
      body: filteredTransactions.map(article => [
        article.id, article.title, article.description, article.price
      ]),
      startY: 20,
      theme: 'grid'
    });
    doc.save('articles_table.pdf');
  };

  const printTable = (Transactions) => {
    console.log("printTable appelé avec:", Transactions);
    if (!Transactions || Transactions.length === 0) return alert("Aucune transaction à imprimer.");

    const printWindow = window.open('', '_blank');
    
    let bodyContent = `
    <div class="header">
        <h1>Reçu de Transaction</h1>
        <p>${new Date().toLocaleDateString()}</p>
    </div>
    `;

    Transactions.forEach((Transactions, index) => {
        const client = Transactions.client || {};
        bodyContent += `
        <div class="section">
            <div class="section-title">Informations Client (Transaction ${index + 1})</div>
            <table>
                <tr><th>Nom complet</th><td>${client.prenom || ''} ${client.nom || ''}</td></tr>
                <tr><th>CIN</th><td>${client.cin || 'N/A'}</td></tr>
                <tr><th>Nationalité</th><td>${client.nationalite || 'N/A'}</td></tr>
                <tr><th>Code Client</th><td>${client.CodeClient || 'N/A'}</td></tr>
                <tr><th>Raison Sociale</th><td>${client.raison_sociale || 'N/A'}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">Détails de la Transaction</div>
            <table>
                <tr><th>Référence</th><td>${Transactions.id || 'N/A'}</td></tr>
                <tr><th>Date</th><td>${new Date(Transactions.dateTransa).toLocaleString()}</td></tr>
                <tr><th>Devise Achat</th><td>${Transactions.from_currency?.code || ''}</td></tr>
                <tr><th>Devise Vente</th><td>${Transactions.to_currency?.code || ''}</td></tr>
                <tr><th>Montant</th><td>${Transactions.montant || 'N/A'} ${Transactions.from_currency?.code || ''}</td></tr>
                <tr><th>Taux appliqué</th><td>${Transactions.taux || 'N/A'}</td></tr>
                <tr><th>Montant Converti</th><td>${Transactions.montant_converti || Transactions.montant_convirtir || 'N/A'} ${Transactions.to_currency?.code || ''}</td></tr>
                <tr><th>Statut</th><td>${Transactions.status || 'N/A'}</td></tr>
            </table>
        </div>
        <hr/>
        `;
    });

    bodyContent += `
        <div class="footer">
            <p>Merci pour votre confiance</p>
            <p>Transaction imprimée le ${new Date().toLocaleString()}</p>
        </div>
    `;

    printWindow.document.write(`
    <html>
        <head>
            <title>Reçu de Transaction</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { color: #2c3e50; margin-bottom: 5px; }
                .header p { color: #7f8c8d; }
                .section { margin-bottom: 15px; }
                .section-title { 
                    background-color: #f2f2f2; 
                    padding: 8px; 
                    font-weight: bold; 
                    margin-bottom: 10px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 10px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f8f9fa; 
                    width: 30%;
                }
                .footer { 
                    margin-top: 30px; 
                    text-align: right; 
                    font-style: italic;
                    color: #7f8c8d;
                }
                hr {
                    margin: 30px 0;
                    border: 1px solid #ccc;
                }
            </style>
        </head>
        <body>
            ${bodyContent}
        </body>
    </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
};

 
 console.log("Transaction:", Transactions);
  
 const columns = [
  { key: "nom_cli", label: "Nom client", minWidth: 100 },
  { key: "prenom_cli", label: "Prenom client", minWidth: 100 },
  { key: "CIN", label: "CIN", minWidth: 100 },
  { key: "natinalite", label: "Nationalite", minWidth: 100 },
  { key: "Code_client", label: "Code", minWidth: 100 },
  { key: "raison_social", label: "Raison social", minWidth: 100 },
  { 
    key: "from_currency", 
    label: "Devise Achat", 
    minWidth: 150,
    render: (row) => (
      <div>
        <div>{row.from_currency_name} ({row.from_currency})</div>
        <div style={{ fontSize: '1.2em' }}>{row.from_currency_symbol}</div>
      </div>
    )
  },
  { 
    key: "to_currency", 
    label: "Devise Vente", 
    minWidth: 150,
    render: (row) => (
      <div>
        <div>{row.to_currency_name} ({row.to_currency})</div>
        <div style={{ fontSize: '1.2em' }}>{row.to_currency_symbol}</div>
      </div>
    )
  },
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
      from_currency_name: transaction.from_currency?.name || '',
      from_currency_symbol: transaction.from_currency?.symbol || '',
      to_currency: transaction.to_currency?.code || '',
      to_currency_name: transaction.to_currency?.name || '',
      to_currency_symbol: transaction.to_currency?.symbol || '',
      montant: transaction.montant,
      taux: transaction.taux,
      montant_converti: transaction.montant_converti || transaction.montant_convirtir || '', 
      status: transaction.status,
      type: transaction.client_type,
      date: transaction.dateTransa
  };
});
  console.log('jobihubiuh',formattedData);
  if (Transactions && Transactions.length > 0) {
    console.log(Object.keys(Transactions[0]));  // Affiche les clés du premier objet de transactions
  } else {
    console.log("Aucune transaction disponible ou transactions est undefined/null");
  }
 
  // Mise à jour des transactions filtrées quand Transactions change
  useEffect(() => {
    setFilteredTransactions(Transactions);
  }, [Transactions]);

  // Fonction pour gérer la suppression d'une transaction
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas revenir en arrière!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://127.0.0.1:8000/api/transactionapi/${id}`)
          .then(response => {
            if (response.status === 200) {
              Swal.fire(
                'Supprimé!',
                'La transaction a été supprimée.',
                'success'
              );
              // Rafraîchir la liste des transactions
              fetchTransactions();
            }
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

  // Fonction pour gérer le changement de statut
  const handleStatusChange = (id, newStatus) => {
    axios.put(`http://127.0.0.1:8000/api/transactionapi/${id}`, {
      status: newStatus
    })
    .then(response => {
      if (response.status === 200) {
        Swal.fire(
          'Succès!',
          'Le statut a été mis à jour.',
          'success'
        );
        // Rafraîchir la liste des transactions
        fetchTransactions();
      }
    })
    .catch(error => {
      console.error('Erreur lors de la mise à jour du statut:', error);
      Swal.fire(
        'Erreur!',
        'Une erreur est survenue lors de la mise à jour du statut.',
        'error'
      );
    });
  };

  // Fonction pour mettre en évidence le texte de recherche
  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  // Gestion de la sélection multiple
  const handleSelectAllChange = (event) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      setSelectedItems(formattedData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Gestion de la suppression multiple
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous êtes sur le point de supprimer ${selectedItems.length} transaction(s).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!'
    }).then((result) => {
      if (result.isConfirmed) {
        Promise.all(selectedItems.map(id => 
          axios.delete(`http://127.0.0.1:8000/api/transactionapi/${id}`)
        ))
        .then(() => {
          Swal.fire(
            'Supprimé!',
            'Les transactions ont été supprimées.',
            'success'
          );
          fetchTransactions();
          setSelectedItems([]);
          setSelectAll(false);
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

  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderStatus = (status) => {
    let backgroundColor = "#FFF7D6"; // Jaune pour "en attente"
    let textColor = "#D69E2E";       // Texte orange foncé
    let statusText = status || "en attente...";
    
    // On peut ajouter d'autres conditions selon les différents statuts
    if (status === "transferer") {
      backgroundColor = "#E6F6EC"; // Vert pâle
      textColor = "#38A169";       // Texte vert
    }
    
    return (
      <div style={{
        backgroundColor: backgroundColor,
        color: textColor,
        padding: "5px 10px",
        borderRadius: "20px",
        display: "inline-block",
        fontSize: "14px",
        fontWeight: "500",
        textAlign: "center",
        minWidth: "100px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}>
        {statusText}
      </div>
    );
  };

  return (
    <>
      <ThemeProvider theme={createTheme()}>
        <Box sx={{ ...dynamicStyles }}>
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 4 }}>
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ marginTop: "15px", }}
            >
              <h3
                className="titreColore  text-red"
                style={{ fontSize: "40px", marginRight: "8px" }}
              >
                {/* <PeopleIcon style={{ fontSize: "24px", marginRight: "8px" }} /> */}
                Echange (Taux Par API)
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
                    onClick={() => printTable([Transactions[Transactions.length - 1]])} 
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
                <div style={{ minWidth: "15%" }}>
                  <Form.Label>Achat</Form.Label>
                  <Select
                    value={devises.find(d => d.id === transaData.from_currency_id) ? {
                      value: transaData.from_currency_id,
                      label: devises.find(d => d.id === transaData.from_currency_id)?.name,
                    } : null}
                    onChange={(selectedOption) => setTransaData({ ...transaData, from_currency_id: selectedOption?.value || "" })}
                    options={devises.map(d => ({ value: d.id, label: d.name }))}
                    isSearchable
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
                      cursor: "pointer",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
                    }}
                    onClick={() => {
                      setTransaData({
                        ...transaData,
                        from_currency_id: transaData.to_currency_id,
                        to_currency_id: transaData.from_currency_id
                      });
                    }}
                  >
                    ← →
                  </button>
                </div>

                {/* Devise Vente */}
                <div style={{ minWidth: "15%" }}>
                  <Form.Label>Vente</Form.Label>
                  <Select
                    value={devises.find(d => d.id === transaData.to_currency_id) ? {
                      value: transaData.to_currency_id,
                      label: devises.find(d => d.id === transaData.to_currency_id)?.name,
                    } : null}
                    onChange={(selectedOption) => setTransaData({ ...transaData, to_currency_id: selectedOption?.value || "" })}
                    options={devises.map(d => ({ value: d.id, label: d.name }))}
                    isSearchable
                  />
                </div>

                {/* Montant */}
                <div style={{ minWidth: "14%" }}>
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
                <div style={{ minWidth: "14%" }}>
                  <Form.Label>Montant Converti</Form.Label>
                  <Form.Control
                    type="text"
                    name="montant_converti"
                    value={transaData.montant_converti}
                    readOnly
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>

                {/* Status
                <div style={{ minWidth: "100px" }}>
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    type="text"
                    name="status"
                    value={transaData.status}
                    onChange={handleChangeTransa}
                    required
                  />
                </div> */}

                {/* Date */}
                <div style={{ minWidth: "14%" }}>
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
              {clientType && clientType !== "externe" && (
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
                <div style={{ width: "100%", marginTop: "20px" }}>
                  <AddClientForm 
                    type="E" 
                    onClientAdded={handleClientExterneData} 
                     
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

            {/* Modal de récapitulation */}
<Modal show={showRecap} onHide={() => setShowRecap(false)} size="md" centered>
  <Modal.Header closeButton>
    <Modal.Title className="fw-bold">Échange de devises (spot)</Modal.Title>
  </Modal.Header>
  <Modal.Body className="px-4 py-3">
    {/* Taux de change en évidence */}
    <div className="text-center mb-4">
      <p className="text-secondary mb-1 small">Votre taux de change</p>
      <h2 className="display-5 fw-bold mb-0">{transaData.taux}</h2>
    </div>
    
    {/* Section devise d'achat/vente */}
    <div className="row mb-4">
      <div className="col-6 text-center">
        <h6 className="mb-3">
          Vous achetez (crédit)
        </h6>
        <div className="bg-light p-3 rounded border d-flex align-items-center justify-content-center" style={{height: "60px"}}>
          <div className="d-flex align-items-center">
            <span className="me-2">
              {/* Emoji dynamique basé sur la devise */}
              {devises.find(d => d.id === transaData.from_currency_id)?.code === 'USD' ? '🇺🇸' : 
               devises.find(d => d.id === transaData.from_currency_id)?.code === 'EUR' ? '🇪🇺' : 
               devises.find(d => d.id === transaData.from_currency_id)?.code === 'GBP' ? '🇬🇧' : ''}
            </span>
            <span className="fw-bold">
              {devises.find(d => d.id === transaData.from_currency_id)?.code} {transaData.montant}
            </span>
          </div>
        </div>
      </div>
      <div className="col-6 text-center">
        <h6 className="mb-3">
          Vous vendez (débit)
        </h6>
        <div className="bg-light p-3 rounded border d-flex align-items-center justify-content-center" style={{height: "60px"}}>
          <div className="d-flex align-items-center">
            <span className="me-2">
              {/* Emoji dynamique basé sur la devise */}
              {devises.find(d => d.id === transaData.to_currency_id)?.code === 'USD' ? '🇺🇸' : 
               devises.find(d => d.id === transaData.to_currency_id)?.code === 'EUR' ? '🇪🇺' : 
               devises.find(d => d.id === transaData.to_currency_id)?.code === 'GBP' ? '🇬🇧' : ''}
            </span>
            <span className="fw-bold">
              {devises.find(d => d.id === transaData.to_currency_id)?.code} {transaData.montant_converti}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    {/* Date et taux détails */}
    <div className="py-2 border-bottom mb-3">
      <div className="d-flex justify-content-between mb-2">
        <span className="text-secondary">Date de valeur</span>
        <span className="fw-bold">{transaData.dateTransa}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="text-secondary">Taux moyen</span>
        <span className="fw-bold">{transaData.taux}</span>
      </div>
    </div>
    
    {/* Information client */}
    <div className="client-info-section mt-4">
      <h6 className="fw-bold pb-2 mb-3 border-bottom">Informations Client</h6>
      
      {/* Pour client externe */}
      {clientType === 'externe' && clientExterneData && (
        <div className="row">
          <div className="col-md-6">
            <p className="mb-2"><span className="text-secondary">Type:</span> Client Externe</p>
            <p className="mb-2"><span className="text-secondary">Nom:</span> {clientExterneData.nom}</p>
            <p className="mb-2"><span className="text-secondary">Prénom:</span> {clientExterneData.prenom}</p>
          </div>
          <div className="col-md-6">
            <p className="mb-2"><span className="text-secondary">CIN:</span> {clientExterneData.cin}</p>
            <p className="mb-2"><span className="text-secondary">Nationalité:</span> {clientExterneData.nationalite}</p>
            {clientExterneData.CodeClient && (
              <p className="mb-2"><span className="text-secondary">Code Client:</span> {clientExterneData.CodeClient}</p>
            )}
          </div>
        </div>
      )}

      {/* Pour client particulier */}
      {clientType === 'particulier' && transaData.client_id && (
        <div className="row">
          <div className="col-md-6">
            <p className="mb-2"><span className="text-secondary">Type:</span> Particulier</p>
            <p className="mb-2"><span className="text-secondary">Nom:</span> {clientsParticulier.find(c => c.id === transaData.client_id)?.nom}</p>
            <p className="mb-2"><span className="text-secondary">Prénom:</span> {clientsParticulier.find(c => c.id === transaData.client_id)?.prenom}</p>
          </div>
          <div className="col-md-6">
            <p className="mb-2"><span className="text-secondary">CIN:</span> {clientsParticulier.find(c => c.id === transaData.client_id)?.cin}</p>
            <p className="mb-2"><span className="text-secondary">Code Client:</span> {clientsParticulier.find(c => c.id === transaData.client_id)?.CodeClient}</p>
            {clientsParticulier.find(c => c.id === transaData.client_id)?.nationalite && (
              <p className="mb-2"><span className="text-secondary">Nationalité:</span> {clientsParticulier.find(c => c.id === transaData.client_id)?.nationalite}</p>
            )}
          </div>
        </div>
      )}

      {/* Pour client société */}
      {clientType === 'societe' && transaData.client_id && (
        <div className="row">
          <div className="col-md-6">
            <p className="mb-2"><span className="text-secondary">Type:</span> Société</p>
            <p className="mb-2"><span className="text-secondary">Raison Sociale:</span> {societeClients.find(c => c.id === transaData.client_id)?.raison_sociale}</p>
          </div>
          <div className="col-md-6">
            <p className="mb-2"><span className="text-secondary">Code Client:</span> {societeClients.find(c => c.id === transaData.client_id)?.CodeClient}</p>
          </div>
        </div>
      )}
    </div>
  </Modal.Body>
  <Modal.Footer className="d-flex justify-content-between">
    <Button variant="outline-secondary" onClick={() => setShowRecap(false)}>Fermer</Button>
    <div>
      <Button variant="primary" onClick={handleConfirmTransaction}>Confirmer</Button>
    </div>
  </Modal.Footer>
</Modal>
          </div>  
              <div style={{marginTop:'3%'}}>
              <h2>Liste des Transactions</h2>
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
                  status: renderStatus(transaction.status || "en attente..."),
                  type: transaction.client_type,
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
      
    </>
  );

};

export { AddTransactionForm };