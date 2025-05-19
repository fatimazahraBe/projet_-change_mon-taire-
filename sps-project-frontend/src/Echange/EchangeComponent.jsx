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
  const [madId, setMadId] = useState(""); 
  const [clientExterneData, setClientExterneData] = useState(null);
const [isClientExterneValid, setIsClientExterneValid] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [transaData, setTransaData] = useState({
    client_id: "",
    client_type: "",
    from_currency_id: "",
    to_currency_id: "",
    montant: "",
    montant_converti: "", // Calculé automatiquement, pas affiché à l'utilisateur
    taux_id: "",
    taux: "", // Calculé automatiquement, pas affiché à l'utilisateur
    status: "Transférer ",
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
      status: "Transférer",
      use_external_api: false,
      dateTransa: new Date().toISOString().split('T')[0]
    });
    setClientType("");
    setFromCurrencyLocked(false);
    setToCurrencyLocked(false);
    setIsExterneFormVisible(false);
  };

  const handleClientExterneData = (data) => {
  setClientExterneData(data);
  
  // Vérifier si les données du client externe sont valides
  const requiredFields = ['nom', 'prenom', 'cin', 'nationalite','CodeClient'];
  const isValid = requiredFields.every(field => data[field] && data[field].trim() !== '');
  setIsClientExterneValid(isValid);
};


  // Soumission du formulaire
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
      
      // Vérifier également les champs de transaction
      if (!transaData.from_currency_id || !transaData.to_currency_id ||
          !transaData.montant || !transaData.taux) {
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
          !transaData.montant || !transaData.taux_id || !transaData.taux) {
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
    axios.post("http://127.0.0.1:8000/api/transaction", {
      ...transaData,
      client_id: clientId
    })
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Succès!",
          text: "Transaction ajoutée avec succès."
        });
        resetForm();
        fetchTransactions(); // Récupérer les transactions mises à jour
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Erreur!",
          text: "Une erreur est survenue lors de l'ajout de la transaction."
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

console.log("Transaction à imprimer :", Transactions);
const formattedData = Transactions.map((transaction) => {
  // Log pour déboguer la transaction spécifique
  console.log("Traitement de la transaction", transaction.id, "avec client_type:", transaction.client_type);
  
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
      client_type: transaction.client_type, // Assurez-vous que cette valeur est correcte
      date: transaction.dateTransa
  };
});
console.log("Vérification des types de client dans les transactions:", 
  Transactions.map(t => ({id: t.id, client_type: t.client_type})));
  console.log("Détail des transactions:", Transactions.map(t => ({
    id: t.id,
    client_type: t.client_type, // Vérifions si cette propriété existe
    // Vérifions également si le type pourrait être stocké ailleurs
    client: t.client,
    type: t.type
})));
console.log("Détail des données formatées:", formattedData.map(row => ({
  id: row.id,
  type: row.type // Vérifions si cette propriété est correctement mappée
})))

console.log("Données formatées après correction:", formattedData.map(row => ({
  id: row.id,
  type: row.type
})));
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
    { key: "client_type", label: "type client", minWidth: 100 },
    { key: "date", label: "Date ", minWidth: 100 }
  ];

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

  const renderStatus = (status) => {
    let backgroundColor = "#FFF7D6"; // Jaune pour "en attente"
    let textColor = "#D69E2E";       // Texte orange foncé
    let statusText = status || "en attente...";
    
    // On peut ajouter d'autres conditions selon les différents statuts
    if (status === "Transférer") {
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
      <div style={{ minWidth: "15%" }}>
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
          Vous {transaData.from_currency_id === madId ? 'vendez' : 'achetez'} (crédit)
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
          Vous {transaData.to_currency_id === madId ? 'vendez' : 'achetez'} (débit)
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
    
    {/* Validité de l'offre */}
    
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
    status: renderStatus(transaction.status || "en attente..."),
    client_type: transaction.client_type, // Ajoutez cette ligne pour inclure le type client
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