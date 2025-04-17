  import './App.css';
import { AuthProvider } from './AuthContext';
import Navigation from './Acceuil/Navigation';
import { Suspense, lazy } from 'react';
import { OpenProvider } from './Acceuil/OpenProvider.jsx';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ClientsAndGroups } from './Client/ClientGrp.jsx';




const Login = lazy(() => import('./Login/Login'));
const Dashboard = lazy(() => import('./Acceuil/Dashboard'));
const ClientList = lazy(() => import('./Client/ClientList'));
const ClientParticulierr = lazy(() => import('./Client/ClientParticulierr'));
const TarifsActuel = lazy(() => import('./Tarifs/TarifsActuel'));
const TarifChambre = lazy(() => import('./Tarifs/TarifChambre'));
const TarifRepas = lazy(() => import('./Tarifs/TarifRepas'));
const TarifReduction = lazy(() => import('./Tarifs/TarifReduction'));
const Chambre = lazy(() => import('./Chambre/Chambre'));
const ChambresDisponibles = lazy(() => import('./Chambre/ChambresDisponibles.jsx'));
const ReclamationPage = lazy(() => import('./reclamation/ReclamationPage'));
const EtatChambre = lazy(() => import('./Chambre/etatChambre'));
const Reservation = lazy(() => import('./Reservation/Reservation'));
const Affichage = lazy(() => import('./Echange/Affichage'));
const Definit_prix = lazy(() => import('./Echange/Definit_prix'));
const Echange = lazy(() => import('./Echange/Echange'));





// const AgentList = lazy(() => import('./Agents/AgentList'));




const App = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== '/login';
  return (
    <AuthProvider>
      <OpenProvider>
      {showNavigation && <Navigation />}
      <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients_societe" element={<ClientList />} />
        <Route path="/clients_particulier" element={<ClientParticulierr />} />
        <Route path="/ClientGrp" element={<ClientsAndGroups />} />
        <Route path="/chambres" element={<Chambre />} />
        <Route path="/tarifs_actuel" element={<TarifsActuel />} />
        <Route path="/tarifs_chambre" element={<TarifChambre />} />
        <Route path="/tarifs_repas" element={<TarifRepas />} />
        <Route path="/tarifs_reduction" element={<TarifReduction />} />
        <Route path="/reclamations" element={<ReclamationPage />} />
        <Route path="/chambres-disponibles" element={<ChambresDisponibles />} />
        <Route path="/etat-chambre" element={<EtatChambre />} />
        <Route path="/reservations" element={<Reservation />} />
        <Route path="/affichage" element={<Affichage/>} />
        <Route path="/prixdevise" element={<Definit_prix/>} />
        <Route path="/echange" element={<Echange/>} />
      </Routes>
      </Suspense>
      </OpenProvider>
    </AuthProvider>
  );
};

export default App;
