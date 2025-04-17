import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTaux } from './Actions';
import { Form, Button } from "react-bootstrap";
import { Fab } from "@mui/material";

const AddtauxForm = () => {
  const [formData, setFormData] = useState({
          id_de_monnaie_de_change: "",
            id_de_monnaie_a_change: "",
            taux: "",
            date_d: "",
            date_f: "",
            source: "manuelle",
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données envoyées:", formData);
    // Envoie les données au store Redux pour l'ajout du client
    dispatch(addTaux(formData));
  };

  return (
    <div style={{ marginTop:"-800px", width:"650px", marginLeft:"85rem" }}>
      {/* Formulaire toujours visible */}
      <div style={{ maxHeight: '700px', overflow: 'auto', padding: '0' }}>
        <Form className="d-flex flex-column align-items-start" onSubmit={handleSubmit}>
          <Form.Label className="w-100 text-center">
            <h4
              style={{
                fontSize: "25px",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                color: "black",
                borderBottom: "2px solid black",
                paddingBottom: "5px",
              }}
            >
              Ajouter un taux
            </h4>
          </Form.Label>

          {/* Nom */}
          <Form.Group className="form-group" style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <Form.Label style={{ minWidth: "170px", fontWeight: "bold", marginRight: "0" }}>
            id_de_monnaie_de_change
            </Form.Label>
            <Form.Control
              type="numeric"
              name="id_de_monnaie_de_change"
              value={formData.id_de_monnaie_de_change}
              onChange={handleChange}
              required
              style={{ minWidth: "100%", maxWidth: "400px" }}
            />
          </Form.Group>

          {/* Prénom */}
          <Form.Group className="form-group" style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <Form.Label style={{ minWidth: "170px", fontWeight: "bold", marginRight: "0" }}>
            id_de_monnaie_a_change
            </Form.Label>
            <Form.Control
              type="numeric"
              name="id_de_monnaie_a_change"
              value={formData.id_de_monnaie_a_change}
              onChange={handleChange}
              required
              style={{ minWidth: "100%", maxWidth: "400px" }}
            />
          </Form.Group>

          {/* CIN */}
          <Form.Group className="form-group" style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <Form.Label style={{ minWidth: "170px", fontWeight: "bold", marginRight: "0" }}>
            taux
            </Form.Label>
            <Form.Control
              type="numeric"
              name="taux"
              value={formData.taux}
              onChange={handleChange}
              required
              style={{ minWidth: "100%", maxWidth: "400px" }}
            />
          </Form.Group>

          {/* Nationalité */}
          <Form.Group className="form-group" style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <Form.Label style={{ minWidth: "170px", fontWeight: "bold", marginRight: "0" }}>
            date_d
            </Form.Label>
            <Form.Control
              type="date"
              name="date_d"
              value={formData.date_d}
              onChange={handleChange}
              required
              style={{ minWidth: "100%", maxWidth: "400px" }}
            />
          </Form.Group>

          {/* Submit Button */}
          <Form.Group className="mt-5 tarif-button-container">
            <div className="button-container">
              <Fab variant="extended" className="btn-sm Fab mb-2 mx-2" type="submit">
                Ajouter Client
              </Fab>
            </div>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export { AddtauxForm };