import { combineReducers } from "redux";

const initialState = {
  clients: [],
};

const initialState2 = {
  transactions: [],
};

const initialState3 = {
  taux: [],
};

const initialState4 = {
  prix: [],
};

// Original prix reducer
export const prixReducer = (state = initialState4, action) => {
  switch (action.type) {
    case 'ADD_Prix':
      return {
        ...state,
        prix: [...state.prix, action.payload],  // Ajouter le nouveau client à la liste des clients
      };
    default:
      return state;
  }
};

export const transactionReducer = (state = initialState2, action) => {
  switch (action.type) {
    case 'ADD_TRANSA':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],  // Ajouter le nouveau client à la liste des clients
      };
    default:
      return state;
  }
};

export const tauxReducer = (state = initialState3, action) => { // Fixed initialState3 here
  switch (action.type) {
    case 'ADD_TAUX':
      return {
        ...state,
        taux: [...(state.taux || []), action.payload],
        // Ajouter le nouveau client à la liste des clients
      };
    default:
      return state;
  }
};

// Enhanced prix reducer with update and delete functionality
const initialState5 = {
  prices: [],
  loading: false,
  error: null
};

// Export this reducer so it can be imported elsewhere
export const updatePrixReducer = (state = initialState5, action) => {
  switch (action.type) {
    case 'ADD_Prix':
      return {
        ...state,
        prices: [...state.prices, action.payload.prix], // Assuming the API returns a 'prix' object
        loading: false
      };
      
    case 'UPDATE_PRIX':
      return {
        ...state,
        prices: state.prices.map(prix => 
          prix.id === action.payload.prix.id ? action.payload.prix : prix
        ),
        loading: false
      };
      
    case 'DELETE_PRIX':
      return {
        ...state,
        prices: state.prices.filter(prix => prix.id !== action.payload.id),
        loading: false
      };
      
    case 'DELETE_MULTIPLE_PRIX':
      return {
        ...state,
        prices: state.prices.filter(prix => !action.payload.ids.includes(prix.id)),
        loading: false
      };
      
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  transaction: transactionReducer,
  taux: tauxReducer,
  prix: prixReducer,          
  updatePrix: updatePrixReducer  
});

export default rootReducer;