import React from 'react';
import { Form } from 'react-bootstrap';

const TransactionFilter = ({ filterValues, onFilterChange }) => {
  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        <Form.Control
          type="text"
          name="nom"
          placeholder="Nom"
          value={filterValues.nom}
          onChange={onFilterChange}
        />
        <Form.Control
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={filterValues.prenom}
          onChange={onFilterChange}
        />
        <Form.Control
          type="text"
          name="cin"
          placeholder="CIN"
          value={filterValues.cin}
          onChange={onFilterChange}
        />
        <Form.Control
          type="text"
          name="nationalite"
          placeholder="Nationalité"
          value={filterValues.nationalite}
          onChange={onFilterChange}
        />
        <Form.Control
          type="text"
          name="code"
          placeholder="Code Client"
          value={filterValues.code}
          onChange={onFilterChange}
        />
        <Form.Control
          type="text"
          name="deviseAchat"
          placeholder="Devise Achat"
          value={filterValues.deviseAchat}
          onChange={onFilterChange}
        />
        <Form.Control
          type="text"
          name="deviseVente"
          placeholder="Devise Vente"
          value={filterValues.deviseVente}
          onChange={onFilterChange}
        />
        <Form.Control
          type="text"
          name="montant"
          placeholder="Montant"
          value={filterValues.montant}
          onChange={onFilterChange}
        />
        <Form.Control
          type="date"
          name="date"
          value={filterValues.date}
          onChange={onFilterChange}
        />
      </div>
    </div>
  );
};

export default TransactionFilter; 