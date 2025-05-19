import React, { useState, useEffect } from 'react';
import { Form, Button } from "react-bootstrap";

const AddClientForm = ({ type, onClientAdded }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    nationalite: '',
    CodeClient: '',
    type: type
  });
  const [errors, setErrors] = useState({});

  // Champs obligatoires pour un client externe
  const requiredFields = ['nom', 'prenom', 'cin', 'nationalite'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value
    };
    setFormData(newData);
    
    // Vérifier et effacer les erreurs lors de la saisie
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Transmettre les données au parent uniquement si elles sont valides
    validateAndSendData(newData);
  };

  const validateAndSendData = (data) => {
    // Vérifier si tous les champs obligatoires sont remplis
    const newErrors = {};
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        newErrors[field] = `Le champ ${field} est obligatoire`;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    
    // Seulement si tous les champs obligatoires sont remplis
    if (isValid) {
      onClientAdded(data);
    } else {
      // Envoyer null ou un objet avec isValid: false pour indiquer que les données ne sont pas valides
      onClientAdded({ ...data, isValid: false });
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <h5 className="mb-3">Informations client externe</h5>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end", width: "100%" }}>
        {['nom', 'prenom', 'cin', 'nationalite', 'CodeClient'].map((field, idx) => (
          <Form.Group key={idx} style={{ flex: "1", minWidth: "150px" }}>
            <Form.Label style={{ fontWeight: "bold" }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {requiredFields.includes(field) && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              isInvalid={!!errors[field]}
              required={requiredFields.includes(field)}
            />
            <Form.Control.Feedback type="invalid">
              {errors[field]}
            </Form.Control.Feedback>
          </Form.Group>
        ))}
      </div>
    </div>
  );
};

export { AddClientForm };