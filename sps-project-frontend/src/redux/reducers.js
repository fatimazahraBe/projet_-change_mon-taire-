import { combineReducers } from "redux";
import { prixReducer, tauxReducer, transactionReducer, updatePrixReducer ,} from "../Echange/reducer2";


// Initial State
const initialState = {
    clients: [],
    groups: [],
    clientgrp: [],
    selectedAdminId: null,
};

// Clients Reducer
const clientsReducer = (state = initialState.clients, action) => {
    switch (action.type) {
        case "FETCH_CLIENTS_SUCCESS":
            return  action.payload
        case "FETCH_CLIENTS_FAILURE":
            return [];
        default:
            return state;
    }
};

// Groups Reducer
const groupsReducer = (state = initialState.groups, action) => {
    switch (action.type) {
        case "FETCH_GROUPS_SUCCESS":
            return action.payload;
        case "DELETE_GROUP_SUCCESS":
            return state.filter(group => group.groupNumber !== action.payload); // Remove deleted group
        default:
            return state;
    }
};


// Group Clients Reducer
const clientgrpReducer = (state = initialState.clientgrp, action) => {
    switch (action.type) {
        case "FETCH_GROUP_CLIENTS_SUCCESS":
            return action.payload;
        case "FETCH_GROUP_CLIENTS_FAILURE":
            return [];
        default:
            return state;
    }
};

// Selected Admin Reducer
const selectedAdminIdReducer = (state = initialState.selectedAdminId, action) => {
    switch (action.type) {
        case "SET_SELECTED_ADMIN_ID":
            return action.payload;
        default:
            return state;
    }
};
  

  
export { rootReducer };

// Combine all reducers
const rootReducer = combineReducers({
    clients: clientsReducer,
    groups: groupsReducer,
    clientgrp: clientgrpReducer,
    selectedAdminId: selectedAdminIdReducer,
   
   transaction: transactionReducer,
   taux:tauxReducer,
   prix:prixReducer,
   updatePrix: updatePrixReducer

});

export default rootReducer;
