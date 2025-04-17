import axios from 'axios';

// Action pour ajouter un client de change
export const addClient = (clientData) => async (dispatch) => {
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/clients', clientData);
    console.log('Client data response:', response.data);

    dispatch({
      type: 'ADD_CLIENT',
      payload: response.data,
    });
    
    
    return { payload: response.data };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du client :', error);
    return null;
  }
};
export const addTransaction = (TransactionData) => async (dispatch) => {
  try {
    console.log("Données envoyées à l'API :", TransactionData); // 🔍 Vérifier avant l'envoi
    
    const response = await axios.post('http://127.0.0.1:8000/api/transaction', TransactionData);

    dispatch({
      type: 'ADD_TRANSA',
      payload: response.data,
    });
  
  } catch (error) {
    console.error('Erreur lors de l\'ajout du TRANSACTION :', error.response?.data || error);
  }
};


  export const addTaux = (TauxData) => async (dispatch) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/tauxdechange', TauxData);  // Remplace par l'URL de ton API
      dispatch({
        type: 'ADD_TAUX',
        payload: response.data,  // Données du client ajoutées
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du Taux :', error);
    }
  };

  export const addprix = (prixdevise) => async (dispatch) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/definit_prix', prixdevise);  // Remplace par l'URL de ton API
      dispatch({
        type: 'ADD_Prix',
        payload: response.data,  // Données du client ajoutées
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du prix :', error);
    }
  };
  

// Add these actions to your existing actions file

// Action for updating a price definition
export const updatePrix = (prixId, updatedData) => async (dispatch) => {
  try {
    const response = await axios.put(`http://127.0.0.1:8000/api/definit_prix/${prixId}`, updatedData);
    
    dispatch({
      type: 'UPDATE_PRIX',
      payload: response.data,
    });
    
    return { payload: response.data };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prix :', error);
    throw error;
  }
};

// Action for deleting a price definition
export const deletePrix = (prixId) => async (dispatch) => {
  try {
    await axios.delete(`http://127.0.0.1:8000/api/definit_prix/${prixId}`);
    
    dispatch({
      type: 'DELETE_PRIX',
      payload: { id: prixId },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du prix :', error);
    throw error;
  }
};

// Action for deleting multiple price definitions
export const deleteMultiplePrix = (prixIds) => async (dispatch) => {
  try {
    // You might need to adjust this endpoint based on your API
    await axios.post(`http://127.0.0.1:8000/api/definit_prix/batch-delete`, { ids: prixIds });
    
    dispatch({
      type: 'DELETE_MULTIPLE_PRIX',
      payload: { ids: prixIds },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression multiple des prix :', error);
    throw error;
  }
};

