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
  const [showExterneModal, setShowExterneModal] = useState(false);
  const [Transactions, setTransactions] = useState([]);
  const [transaData, setTransaData] = useState({
    client_id: "",
    client_type: "",
    from_currency_id: "",
    to_currency_id: "",
    montant: "",
    taux_id: "",
    status: "",
    use_external_api: true,
    dateTransa: new Date().toISOString().split('T')[0]
});
  const [isExterneFormVisible, setIsExterneFormVisible] = useState(false);
  const { dynamicStyles } = useOpen();
  const { open } = useOpen();

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
      axios.get("http://127.0.0.1:8000/api/transaction")
      .then(response => {
        console.log("Réponse complète :", response.data);
        
        // Correction ici: utiliser 'transactions' au lieu de 'Transaction'
        const transac = response.data.transactions || [];
        
        console.log("Transactions extraites :", transac); // Notez 'transac' au lieu de 'Transactions'
        setTransactions(transac);
        
        console.log("Après setTransactions :", transac);
      })
      .catch(error => console.error("Erreur lors de la récupération des transactions:", error));
    }, []);

  const handleChangeTransa = (e) => {
    const { name, value } = e.target;
    setTransaData({ ...transaData, [name]: value });
  };

  useEffect(() => {
    if (transaData.from_currency_id && transaData.to_currency_id) {
      axios.get('http://127.0.0.1:8000/api/tauxdechange')
        .then(response => {
          console.log("Réponse complète de l'API :", response.data); // DEBUG

          // Vérification et extraction correcte des taux de change
          const tauxData = response.data.TauxDeChange || []; // On récupère uniquement le tableau

          if (tauxData.length === 0) {
            console.warn("Aucun taux de change disponible.");
            setTransaData(prevState => ({
              ...prevState,
              taux_id: "", // Réinitialiser le taux si aucun taux trouvé
            }));
            return;
          }

          // Trouver le taux correspondant
          const tauxCorrespondant = tauxData.find(t =>
            t.id_de_monnaie_de_change === transaData.from_currency_id &&
            t.id_de_monnaie_a_change === transaData.to_currency_id
          );

          if (tauxCorrespondant) {
            console.log("Taux trouvé :", tauxCorrespondant);
            setTransaData(prevState => ({
              ...prevState,
              taux_id: tauxCorrespondant.id,
            }));
          } else {
            alert("Aucun taux valide disponible pour cette paire de devises.");
            setTransaData(prevState => ({
              ...prevState,
              taux_id: "",
            }));
          }
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des taux de change :", error);
        });
    }
  }, [transaData.from_currency_id, transaData.to_currency_id]);


  
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

 // Update the handleSubmit function in your AddTransactionForm component
const handleSubmit = (e) => {
  e.preventDefault();

  console.log("Données avant soumission :", transaData);

  // Use axios to submit the transaction instead of Redux dispatch
  axios.post("http://127.0.0.1:8000/api/transaction", transaData)
    .then(response => {
      console.log("Transaction ajoutée:", response.data);
      
      // Show success message with SweetAlert2
      Swal.fire({
        icon: "success",
        title: "Succès!",
        text: "Transaction ajoutée avec succès.",
      });
      
      // Reset the form
      setTransaData({
        client_id: "",
        client_type: "",
        from_currency_id: "",
        to_currency_id: "",
        montant: "",
        taux_id: "",
        status: "",
        use_external_api: true,
        dateTransa: new Date().toISOString().split('T')[0]
      });
      
      // Reset client type
      setClientType("");
      
      // Fetch updated transactions without page refresh
      fetchTransactions();
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout de la transaction:", error);
      
      // Show error message
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
      
      // Update transactions state with new data
      const transac = response.data.transactions || [];
      setTransactions(transac);
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des transactions:", error);
    });
};

  const handleSearch = (query) => {
    setSearchQuery(query);
    setFilteredArticles(articles.filter(article =>
      article.title.toLowerCase().includes(query.toLowerCase())
    ));
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
      body: filteredArticles.map(article => [
        article.id, article.title, article.description, article.price
      ]),
      startY: 20,
      theme: 'grid'
    });
    doc.save('articles_table.pdf');
  };

  const printTable = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des Articles</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Liste des Articles</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Description</th>
                <th>Prix</th>
              </tr>
            </thead>
            <tbody>
              ${filteredArticles.map(article => `
                <tr>
                  <td>${article.id}</td>
                  <td>${article.title}</td>
                  <td>${article.description}</td>
                  <td>${article.price}</td>
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
 
 console.log("Transaction:", Transactions);
  
 const columns = [
  { key: "nom_cli", label: "Nom client", minWidth: 100 },
  { key: "prenom_cli", label: "Prenom client", minWidth: 100 },
  { key: "CIN", label: "CIN", minWidth: 100 },
  { key: "natinalite", label: "Nationalite", minWidth: 100 },
  { key: "Code_client", label: "Code", minWidth: 100 },
  { key: "raison_social", label: "Raison social", minWidth: 100 },
  { key: "from_currency", label: "Devise Origine", minWidth: 100 },
  { key: "to_currency", label: "Devise Cible", minWidth: 100 },
  { key: "montant", label: "Montant", minWidth: 100 },
  { key: "taux", label: "Taux", minWidth: 100 },
  { key: "montant_converti", label: "Montant Converti", minWidth: 100 },
  { key: "status", label: "Statut", minWidth: 100 },
  { key: "date", label: "Date ", minWidth: 100 }
];

const formattedData = Transactions.map((transaction) => {
  return {
      id: transaction.id,
      nom_cli: transaction.client?.nom || 'N/A', // Correction: utilisation de nom_cli au lieu de nom
      prenom_cli: transaction.client?.prenom|| 'N/A',
      CIN: transaction.client?.cin || 'N/A',
      natinalite: transaction.client?.nationalite || 'N/A',
      Code_client: transaction.client?.CodeClient || 'N/A',
      raison_social: transaction.client?.raison_sociale || 'N/A',
      from_currency: transaction.from_currency?.code || 'N/A',
      to_currency: transaction.to_currency?.code || 'N/A',
      montant: transaction.montant,
      taux: transaction.taux,
      montant_converti: transaction.montant_converti || transaction.montant_convirtir || 'N/A', 
      status: transaction.status,
      date: transaction.dateTransa
  };
});
  console.log('jobihubiuh',formattedData);
  if (Transactions && Transactions.length > 0) {
    console.log(Object.keys(Transactions[0]));  // Affiche les clés du premier objet de transactions
  } else {
    console.log("Aucune transaction disponible ou transactions est undefined/null");
  }
 

  


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
                Echange
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
                backgroundColor:"#fff",
                marginTop: "2%",
                padding: "20px",
                display: "flex",
                borderRadius: "8px",
              
                flexWrap: "wrap",
                 width: isExterneFormVisible ? "calc(100% - 515px)" : "100%", // Reduce width when form is visible
                    transition: "width 0.3s ease"
              }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: "1%", 
      // Deux colonnes équilibrées 
     
   }}>

                  {/* Sélection des devises */}
                  <div style={{
                    display: "flex", gap: "15px", width: "35%",
                  }}>
                    <div style={{ flex: "1", minWidth: "200px" }}>
                      <Form.Label>Devise d'origine</Form.Label>
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

                    {/* Bouton de switch avec deux flèches */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "30px" }}>
                      <button
                        type="button"
                        style={{
                          border: "none",
                          backgroundColor: "#f0f0f0",
                          padding: "5px",
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
                        ← → {/* Deux flèches */}
                      </button>
                    </div>

                    <div style={{ flex: "1", minWidth: "200px" }}>
                      <Form.Label>Devise cible</Form.Label>
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

                  </div>

                  {/* Montant et Status */}
                  <div style={{ display: "flex", gap: "15px", width: "35%" }}>
                    <Form.Group style={{ flex: "1", minWidth: "200px" }}>
                      <Form.Label>Montant</Form.Label>
                      <Form.Control
                        type="number"
                        name="montant"
                        value={transaData.montant}
                        onChange={handleChangeTransa}
                        required
                      />
                    </Form.Group>

                    <Form.Group style={{ flex: "1", minWidth: "200px" }}>
                      <Form.Label>Status</Form.Label>
                      <Form.Control
                        type="text"
                        name="status"
                        value={transaData.status}
                        onChange={handleChangeTransa}
                        required
                      />
                    </Form.Group>
                    <Form.Group style={{ flex: "1", minWidth: "200px" }}>
    <Form.Label>Date</Form.Label>
    <Form.Control
        type="date"
        name="dateTransa"
        value={transaData.dateTransa}
        onChange={handleChangeTransa}
        required
    />
</Form.Group>
                    
                  </div>

                  


                  {/* Type de client */}
                  <Form.Group className="mt-3" style={{ width: "100%" }}>
                    <Form.Label>Type de Client</Form.Label>
                    <div style={{ display: "flex", gap: "20px" }}>
                      <Form.Check type="radio" label="Société" name="client_type" value="societe"
                        checked={clientType === "societe"} onChange={handleClientTypeChange} inline />
                      <Form.Check type="radio" label="Particulier" name="client_type" value="particulier"
                        checked={clientType === "particulier"} onChange={handleClientTypeChange} inline />
                      <Form.Check type="radio" label="Externe" name="client_type" value="externe"
                        checked={clientType === "externe"} onChange={handleClientTypeChange} inline />
                    </div>
                  </Form.Group>

                  {/* Sélection client */}
                  <div style={{ display: "flex", gap: "15px", width: "100%" }}>
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
                              label: clientsParticulier.find(c => c.id === transaData.client_id)?.name + " " + clientsParticulier.find(c => c.id === transaData.client_id)?.prenom,
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
                    )  : null}
                  </div>

                  {/* Bouton d'échange */}
                  <Form.Group className="mt-5" style={{ width: "100%", textAlign: "center" }}>
                    <Fab variant="extended" className="btn-sm Fab mb-2 mx-2" type="submit">
                      Échange
                    </Fab>
                  </Form.Group>
                </form>
                {clientType === "externe" && (
  <div style={{
    position: "fixed",
    top: "19%",
    right: "1%",
  }}>
    <AddClientForm type="E" onClientAdded={(clientId) => {
      setTransaData({ ...transaData, client_id: clientId });
    }} />
  </div>
)}
              </div >  
              <div style={{marginTop:'3%'}}>
      <h2>Liste des Transactions</h2>
      <TableWithPagination 
  columns={columns}
  formattedData={formattedData}
  Transactions={Transactions}
/>
      </div>

          </Box>
        </Box>
      </ThemeProvider>
      
    </>
  );

};

export { AddTransactionForm };