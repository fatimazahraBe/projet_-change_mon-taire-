import React, { useState } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useOpen } from "../Acceuil/OpenProvider";
const TableWithPagination = ({ 
  columns, 
  formattedData, 
  Transactions 
}) => {
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
const { dynamicStyles } = useOpen();
  const [isExterneFormVisible, setIsExterneFormVisible] = useState(false);

  // Calcul des données paginées
  const totalPages = Math.ceil(formattedData.length / rowsPerPage);
  const paginatedData = formattedData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  // Gestionnaires d'événements
  const handlePrevious = () => setCurrentPage(p => Math.max(p - 1, 0));
  const handleNext = () => setCurrentPage(p => Math.min(p + 1, totalPages - 1));
  
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  // Filtrer les données en fonction du terme de recherche
  const filteredData = paginatedData.filter(item => {
    return columns.some(column => 
      item[column.key] && item[column.key].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calcul des indices affichés
  const startItem = currentPage * rowsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * rowsPerPage, formattedData.length);

  return (
    <div sx={{ ...dynamicStyles }} style={{flexWrap: "wrap",
        width: isExterneFormVisible ? "calc(100% - 515px)" : "100%", // Reduce width when form is visible
           transition: "width 0.3s ease"}}>
    <div className="table-container" >
      {/* Conteneur avec défilement pour tout le tableau et les contrôles */}
      <div className="table-scroll-container">
    

        {/* Tableau principal */}
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} className="sticky-header">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id || index}>
                  {columns.map(column => (
                    <td key={`${column.key}-${index}`}>
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>Aucune donnée disponible</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Barre de pagination - placé sous la table */}
        <div className="pagination-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Lignes par page:</span>
            <select 
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              style={{ marginRight: '15px', padding: '5px'}}
            >
              {[5, 10, 15, 20, 25].map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <span>{`${startItem}-${endItem} sur ${formattedData.length}`}</span>
          </div>
          
          <div>
            <button onClick={handlePrevious} disabled={currentPage === 0}>
              &#10094;
            </button>
            <button onClick={handleNext} disabled={currentPage >= totalPages - 1}>
              &#10095;
            </button>
          </div>
        </div>
      </div>

      {/* Section Transactions */}
      {Transactions && Transactions.length > 0 && (
        <div className="transactions-section">
          
          <ul>
            {Transactions.map(transaction => (
              <li key={transaction.id}>
                {transaction.id} - {transaction.client_type}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Styles */}
      <style >{`
        .table-container {
          width: 100%;
          margin: 20px 0;
        }

        /* Conteneur avec défilement pour tout le tableau et les contrôles */
        .table-scroll-container {
          max-height: 400px;  /* Ajuste la hauteur du corps de la table */
          overflow-y: auto;   /* Active le défilement vertical */
          padding-bottom: 50px;  /* Pour donner un peu de marge pour la pagination */
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .sticky-header {
          position: sticky;
          top: -3%;
          background-color: #f2f2f2;
          z-index: 2;
          padding: 12px;
        }

        .data-table th, .data-table td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: center;
        }

        .pagination-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          margin-top: 10px;
          cursor: pointer;
          margin-left:75%;
          
        }

        .transactions-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        button {
          padding: 5px 10px;
          margin: 0 5px;
          background: #f2f2f2;
         border-color:transparent;
          cursor: pointer;
        }

        button:hover:not(:disabled) {
          background: #e2e2e2;
        }
      `}</style>
    </div>
    </div>
   
  );
};

export default TableWithPagination;