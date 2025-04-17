// Dans AddClientForm.jsx, modifiez le rendu pour utiliser un div au lieu d'un form

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addClient } from './Actions';
import { Form } from "react-bootstrap";
import { Fab } from "@mui/material";

const AddClientForm = ({ type, onClientAdded }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    nationalite: '',
    CodeClient: "",
    type: type
  });
  const [errors, setErrors] = useState({});
 
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom) newErrors.nom = "Nom est requis";
    if (!formData.prenom) newErrors.prenom = "Prénom est requis";
    if (!formData.cin) newErrors.cin = "CIN est requis";
    if (!formData.nationalite) newErrors.nationalite = "Nationalité est requise";
    if (!formData.CodeClient) newErrors.CodeClient = "Code Client est requis";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log("Données avant envoi:", formData);
      const result = await dispatch(addClient(formData));
      console.log("Client ajouté avec succès");
      
      if (onClientAdded && result?.payload?.client?.id) {
        onClientAdded(result.payload.client.id);
      }
      
      setFormData({
        nom: '',
        prenom: '',
        cin: '',
        nationalite: '',
        CodeClient: "",
        type: type
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  return (
    <div style={{ width: "100%"}}>
      {/* Changé de form à div pour éviter le problème de nidification */}
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-end", width: "100%" }}>
          {/* Nom */}
          <Form.Group style={{ flex: "1", minWidth: "150px" }}>
            <Form.Label style={{ fontWeight: "bold" }}>Nom</Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              isInvalid={!!errors.nom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nom}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Prénom */}
          <Form.Group style={{ flex: "1", minWidth: "150px" }}>
            <Form.Label style={{ fontWeight: "bold" }}>Prénom</Form.Label>
            <Form.Control
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              isInvalid={!!errors.prenom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.prenom}
            </Form.Control.Feedback>
          </Form.Group>

          {/* CIN */}
          <Form.Group style={{ flex: "1", minWidth: "150px" }}>
            <Form.Label style={{ fontWeight: "bold" }}>CIN</Form.Label>
            <Form.Control
              type="text"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              isInvalid={!!errors.cin}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cin}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Nationalité */}
          <Form.Group style={{ flex: "1", minWidth: "150px" }}>
            <Form.Label style={{ fontWeight: "bold" }}>Nationalité</Form.Label>
            <Form.Control
              type="text"
              name="nationalite"
              value={formData.nationalite}
              onChange={handleChange}
              isInvalid={!!errors.nationalite}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nationalite}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Code Client */}
          <Form.Group style={{ flex: "1", minWidth: "150px" }}>
            <Form.Label style={{ fontWeight: "bold" }}>Code Client</Form.Label>
            <Form.Control
              type="text"
              name="CodeClient"
              value={formData.CodeClient}
              onChange={handleChange}
              isInvalid={!!errors.CodeClient}
            />
            <Form.Control.Feedback type="invalid">
              {errors.CodeClient}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Submit Button */}
          <Form.Group style={{ display: "flex", alignItems: "flex-end" }}>
            <Fab 
              variant="extended" 
              className="Fab" 
              onClick={handleSubmit}
              style={{ height: "40px", marginBottom: "0" }}
            >
              Ajouter Client
            </Fab>
          </Form.Group>
        </div>
      </div>
    </div>
  );
};

export { AddClientForm };