<?php

use Illuminate\Http\Request;
use App\Http\Controllers\VueController;
use App\Http\Controllers\InfoController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\EtageController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EnfantController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\SuiviInterventionController;
use App\Http\Controllers\SecteurController;
use App\Http\Controllers\TypeRepasController;
use App\Http\Controllers\EquipementController;
use App\Http\Controllers\SiteClientController;
use App\Http\Controllers\TarifRepasController;
use App\Http\Controllers\IntervenantController;
use App\Http\Controllers\ModePaimantController;
use App\Http\Controllers\TarifActuelController;
use App\Http\Controllers\TypeChambreController;
use App\Http\Controllers\InterventionController;
use App\Http\Controllers\ModePaiementController;
use App\Http\Controllers\RepresantantController;
use App\Http\Controllers\RepresentantController;
use App\Http\Controllers\TarifChambreController;
use App\Http\Controllers\clientsocieteController;
use App\Http\Controllers\ContactClientController;
use App\Http\Controllers\SecteurClientController;
use App\Http\Controllers\TypeReductionController;
use App\Http\Controllers\TarifReductionController;
use App\Http\Controllers\TarifRepasDetailController;
use App\Http\Controllers\ClientParticulierController;
use App\Http\Controllers\MaintenanceRecordController;
use App\Http\Controllers\TarifChambreDetailController;
use App\Http\Controllers\TarifReductionDetailController;
use App\Http\Controllers\SiteClientParticulierController;
use App\Http\Controllers\SecteurClientParticulierController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\ChambreController;
use App\Http\Controllers\ClientGrpController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ReclamationController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EtatChambreController;
use App\Http\Controllers\MaintenanceTypeController;
use App\Http\Controllers\ReclamationChambreController;
use App\Http\Controllers\DeviseController;
use App\Http\Controllers\ClientsEchngeController;
use App\Http\Controllers\TauxdechangeController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\DifinitPrixController;
use App\Http\Controllers\EchangeController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('reclamations_chambre',ReclamationChambreController::class);
//taux de change root
Route::get('/tauxdechange', [TauxdechangeController::class, 'index'])->name('tauxdechange');
Route::post('/tauxdechange', [TauxdechangeController::class, 'store']);
Route::put('/tauxdechange/{id}', [TauxdechangeController::class, 'update']);
//clients d'echange
Route::get('/clientEch', [ClientsEchngeController::class, 'index'])->name('clientEch');
Route::post('/clientEch', [ClientsEchngeController::class, 'store']);
Route::put('/clientEch/{id}', [ClientsEchngeController::class, 'update']);
//devisees root
Route::get('/devises', [DeviseController::class, 'index'])->name('devises');
Route::post('/devises', [DeviseController::class, 'store']);
Route::put('/devises/{id}', [DeviseController::class, 'update']);
//root echange
Route::get('/echange', [EchangeController::class, 'index'])->name('echange');
// root transaction
Route::get('transaction', [TransactionController::class, 'index']);
Route::post('transaction', [TransactionController::class, 'store']);
Route::put('transaction/{id}', [TransactionController::class, 'update']);
Route::delete('transaction/{id}', [TransactionController::class, 'destroy']);

//definit prix de devise
Route::get('/definit_prix', [DifinitPrixController::class, 'index']);
Route::post('/definit_prix', [DifinitPrixController::class, 'store']);
Route::put('/definit_prix/{id}', [DifinitPrixController::class, 'update']);
Route::delete('/definit_prix/{id}', [DifinitPrixController::class, 'destroy']);

//groups routes
Route::get('/groups', [GroupController::class, 'index']);
Route::get('/groups/{groupNumber}', [GroupController::class, 'getGroupByNumber']);
Route::delete('/groups/{groupNumber}', [GroupController::class, 'destroy']);

// client par groupe
Route::get('/clientgrp', [ClientGrpController::class, 'index']);
Route::post('/clientgrp', [ClientgrpController::class, 'store']);
Route::get('/clientgrp', [ClientGrpController::class, 'getClients']);



// Client Particulier routes: Tested
Route::get('/clients-particulier', [ClientParticulierController::class, 'getAll']);
Route::post('/clients-particulier', [ClientParticulierController::class, 'ajouterClient']);
Route::get('/clients-particulier/{code}', [ClientParticulierController::class, 'afficherClient']);
Route::put('/clients-particulier/{code}', [ClientParticulierController::class, 'updateClient']);
Route::delete('/clients-particulier/{code}', [ClientParticulierController::class, 'supprimerClient']);
Route::get('/clientagence', [ClientParticulierController::class, 'getClients']);

// Tarifs Chambre routes :Tested
Route::get('/tarifs-chambre', [TarifChambreDetailController::class, 'getAll']);
Route::post('/tarifs-chambre', [TarifChambreDetailController::class, 'ajouterTarifChambreDetail']);
Route::get('/tarifs-chambre/{tarif_chambre_code}', [TarifChambreDetailController::class, 'afficherTarifChambreDetail']);
Route::put('/tarifs-chambre/{tarif_chambre_code}', [TarifChambreDetailController::class, 'updateTarifChambreDetail']);
Route::delete('/tarifs-chambre/{tarif_chambre_code}', [TarifChambreDetailController::class, 'supprimerTarifChambreDetail']);

// Tarifs Repas routes: Tested
Route::get('/tarifs-repas', [TarifRepasDetailController::class, 'getAll']);
Route::middleware('throttle:60,1')->post('/tarifs-repas', [TarifRepasDetailController::class, 'ajouterTarifRepasDetail']);
Route::get('/tarifs-repas/{tarif_repas_code}', [TarifRepasDetailController::class, 'afficherTarifRepasDetail']);
Route::put('/tarifs-repas/{tarif_repas_code}', [TarifRepasDetailController::class, 'updateTarifRepasDetail']);
Route::delete('/tarifs-repas/{tarif_repas_code}', [TarifRepasDetailController::class, 'supprimerTarifRepasDetail']);

// Tarifs Reduction routes: Tested
Route::get('/tarifs-reduction', [TarifReductionDetailController::class, 'getAll']);
Route::post('/tarifs-reduction', [TarifReductionDetailController::class, 'ajouterTarifReductionDetail']);
Route::get('/tarifs-reduction/{tarif_reduction_code}', [TarifReductionDetailController::class, 'afficherTarifReductionDetail']);
Route::put('/tarifs-reduction/{tarif_reduction_code}', [TarifReductionDetailController::class, 'updateTarifReductionDetail']);
Route::delete('/tarifs-reduction/{tarif_reduction_code}', [TarifReductionDetailController::class, 'supprimerTarifReductionDetail']);

// Tarifs Actuel routes: Tested
Route::get('/tarifs-actuel', [TarifActuelController::class, 'getAll']);
Route::post('/tarifs-actuel', [TarifActuelController::class, 'ajouterTarifActuel']);
Route::get('/tarifs-actuel/{tarif_actuel_code}', [TarifActuelController::class, 'afficherTarifActuel']);
Route::put('/tarifs-actuel/{tarif_actuel_code}', [TarifActuelController::class, 'updateTarifActuel']);
Route::delete('/tarifs-actuel/{tarif_actuel_code}', [TarifActuelController::class, 'supprimerTarifActuel']);

// Types Chambre routes :Tested



Route::get('/types-chambre', [TypeChambreController::class, 'getAll']);
Route::post('/types-chambre', [TypeChambreController::class, 'ajouterTypeChambre']);
Route::get('/types-chambre/{type_chambre_code}', [TypeChambreController::class, 'afficherTypeChambre']);
Route::put('/types-chambre/{type_chambre_code}', [TypeChambreController::class, 'updateTypeChambre']);
Route::delete('/types-chambre/{type_chambre_code}', [TypeChambreController::class, 'supprimerClient']);

// Types Reduction routes :Tested
Route::get('/types-reduction', [TypeReductionController::class, 'getAll']);
Route::post('/types-reduction', [TypeReductionController::class, 'ajouterTypeReduction']);
Route::get('/types-reduction/{type_reduction_code}', [TypeReductionController::class, 'afficherTypeReduction']);
Route::put('/types-reduction/{type_reduction_code}', [TypeReductionController::class, 'updateTypeReduction']);
Route::delete('/types-reduction/{type_reduction_code}', [TypeReductionController::class, 'supprimerClient']);


// Types Repas routes :Tested
Route::get('/types-repas', [TypeRepasController::class, 'getAll']);
Route::post('/types-repas', [TypeRepasController::class, 'ajouterTypeRepas']);
Route::get('/types-repas/{type_repas_code}', [TypeRepasController::class, 'afficherTypeRepas']);
Route::put('/types-repas/{type_repas_code}', [TypeRepasController::class, 'updateTypeRepas']);
Route::delete('/types-repas/{type_repas_code}', [TypeRepasController::class, 'supprimerClient']);


// Chambres routes :Tested
Route::get('/chambres', [ChambreController::class, 'getAll']);
Route::post('/chambres', [ChambreController::class, 'ajouterChambre']);
Route::get('/chambres/{num_chambre}', [ChambreController::class, 'afficherChambre']);
Route::put('/chambres/{num_chambre}', [ChambreController::class, 'updateChambre']);
Route::delete('/chambres/{num_chambre}', [ChambreController::class, 'supprimerChambre']);
Route::delete('/all-chambres', [ChambreController::class, 'supprimerChambres']);
// Info routes: Tested
Route::get('/infos', [InfoController::class, 'getAll']);
Route::post('/infos', [InfoController::class, 'ajouterInfo']);
Route::get('/infos/{info_id}', [InfoController::class, 'afficherInfo']);
Route::put('/infos/{info_id}', [InfoController::class, 'updateInfo']);
Route::delete('/infos/{info_id}', [InfoController::class, 'supprimerInfo']);

// Info routes: Tested
Route::get('/desigs-chambre', [TarifChambreController::class, 'getAll']);
Route::post('/desigs-chambre', [TarifChambreController::class, 'ajouterDesiTarif']);
Route::get('/desigs-chambre/{desigs_id}', [TarifChambreController::class, 'afficherDesiTarif']);
Route::put('/desigs-chambre/{desigs_id}', [TarifChambreController::class, 'updateDesiTarif']);
Route::delete('/desigs-chambre/{desigs_id}', [TarifChambreController::class, 'supprimerDesiTarif']);

Route::get('/desigs-repas', [TarifRepasController::class, 'getAll']);
Route::post('/desigs-repas', [TarifRepasController::class, 'ajouterDesiTarif']);
Route::get('/desigs-repas/{desigs_id}', [TarifRepasController::class, 'afficherDesiTarif']);
Route::put('/desigs-repas/{desigs_id}', [TarifRepasController::class, 'updateDesiTarif']);
Route::delete('/desigs-repas/{desigs_id}', [TarifRepasController::class, 'supprimerDesiTarif']);

Route::get('/vues', [VueController::class, 'getAll']);
Route::post('/vues', [VueController::class, 'ajouterVue']);
Route::get('/vues/{vue}', [VueController::class, 'afficherVue']);
Route::put('/vues/{vue}', [VueController::class, 'updateVue']);
Route::delete('/vues/{vue}', [VueController::class, 'supprimerVue']);

Route::get('/etages', [EtageController::class, 'getAll']);
Route::post('/etages', [EtageController::class, 'ajouterEtage']);
Route::get('/etages/{etage}', [EtageController::class, 'afficherEtage']);
Route::put('/etages/{etage}', [EtageController::class, 'updateEtage']);
Route::delete('/etages/{etage}', [EtageController::class, 'supprimerEtage']);

Route::get('/chambres', [ChambreController::class, 'index']);
Route::post('/chambres', [ChambreController::class, 'ajouterChambre']);

Route::put('/chambres/{id}', [ChambreController::class, 'update']);
Route::delete('/chambres/{id}', [ChambreController::class, 'destroy']);

Route::get('/desigs-reduction', [TarifReductionController::class, 'getAll']);
Route::post('/desigs-reduction', [TarifReductionController::class, 'ajouterDesiTarif']);
Route::get('/desigs-reduction/{desigs_id}', [TarifReductionController::class, 'afficherDesiTarif']);
Route::put('/desigs-reduction/{desigs_id}', [TarifReductionController::class, 'updateDesiTarif']);
Route::delete('/desigs-reduction/{desigs_id}', [TarifReductionController::class, 'supprimerDesiTarif']);

Route::get('clients_particulier/{clientId}/siteclients', [ClientParticulierController::class, 'siteclients']);
Route::get('clients_particulier/{clientId}/bonslivraison', [ClientParticulierController::class, 'bonsLivraisonClient']);
Route::get('clients_particulier', [ClientParticulierController::class, 'index']);
Route::post('clients_particulier', [ClientParticulierController::class, 'store']);
Route::get('clients_particulier/{client}', [ClientParticulierController::class, 'show']);
Route::put('clients_particulier/{client}', [ClientParticulierController::class, 'update']);
Route::delete('clients_particulier/{client}', [ClientParticulierController::class, 'destroy']);
Route::get('DachbordeData', [ClientParticulierController::class, 'getAllDataDachborde']);
Route::get('all-data-client-particulier', [ClientParticulierController::class, 'getAllData']);

// Site Clients
Route::get('siteclients_particulier', [SiteClientParticulierController::class, 'index']); // Route pour obtenir tous les site clients
Route::get('siteclients_particulier/{siteclient}', [SiteClientParticulierController::class, 'show']);
Route::put('siteclients_particulier/{siteclient}', [SiteClientParticulierController::class, 'update']);
Route::post('siteclients_particulier', [SiteClientParticulierController::class, 'store']);
Route::delete('siteclients_particulier/{siteclient}', [SiteClientParticulierController::class, 'destroy']);

Route::get('clients/{clientId}/siteclients', [ClientController::class, 'siteclients']);
Route::get('clients/{clientId}/bonslivraison', [ClientController::class, 'bonsLivraisonClient']);
Route::get('clients', [ClientController::class, 'index']);
Route::post('clients', [ClientController::class, 'store']);
Route::get('clients/{client}', [ClientController::class, 'show']);
Route::put('clients/{client}', [ClientController::class, 'update']);
Route::delete('clients/{client}', [ClientController::class, 'destroy']);
Route::get('DachbordeData', [ClientController::class, 'getAllDataDachborde']);
Route::get('all-data-client', [ClientController::class, 'getAllData']);

// Site Clients
Route::get('siteclients', [SiteClientController::class, 'index']); // Route pour obtenir tous les site clients
Route::get('siteclients/{siteclient}', [SiteClientController::class, 'show']);
Route::put('siteclients/{siteclient}', [SiteClientController::class, 'update']);
Route::post('siteclients', [SiteClientController::class, 'store']);
Route::delete('siteclients/{siteclient}', [SiteClientController::class, 'destroy']);
//region
Route::get('regions', [RegionController::class, 'index']);
Route::post('regions', [RegionController::class, 'store']);
Route::get('regions/{region}', [RegionController::class, 'show']);
Route::put('regions/{region}', [RegionController::class, 'update']);
Route::delete('regions/{region}', [RegionController::class, 'destroy']);

//zone
Route::get('zones', [ZoneController::class, 'index']);
Route::post('zones', [ZoneController::class, 'store']);
Route::get('zones/{zone}', [ZoneController::class, 'show']);
Route::put('zones/{zone}', [ZoneController::class, 'update']);
Route::delete('zones/{zone}', [ZoneController::class, 'destroy']);

// Secteur Clients
Route::apiResource('secteur_clients', SecteurClientController::class);

//Contact client
Route::post('/contactClient', [ContactClientController::class, 'store']);
Route::put('/contactClient', [ContactClientController::class, 'update']);
Route::delete('/contactClient/{id}', [ContactClientController::class, 'destroy']);

//Info client
Route::post('/infoClient', [EnfantController::class, 'store']);
Route::put('/infoClient', [EnfantController::class, 'update']);
Route::delete('/infoClient/{id}', [EnfantController::class, 'destroy']);

Route::apiResource('representant', RepresantantController::class);

Route::apiResource('mode-paimants', ModePaimantController::class);

/*  WARNING! - IT SHOULD BE REMOVED AFTER FINSHING THE WORK ON IT*/
Route::get('/equipements', [EquipementController::class, 'index']);
Route::post('/equipements', [EquipementController::class, 'store']);
Route::get('/equipements/{id}', [EquipementController::class, 'show']);
Route::put('/equipements/{id}', [EquipementController::class, 'update']);
Route::post('/equipements/{id}', [EquipementController::class, 'update']);
Route::delete('/equipements/{id}', [EquipementController::class, 'destroy']);

Route::get('/interventions', [InterventionController::class, 'index']);
Route::post('/interventions', [InterventionController::class, 'store']);
Route::get('/interventions/{id}', [InterventionController::class, 'show']);
Route::put('/interventions/{id}', [InterventionController::class, 'update']);
Route::delete('/interventions/{id}', [InterventionController::class, 'destroy']);

Route::get('/suivi_interventions', [SuiviInterventionController::class, 'index']);
Route::post('/suivi_interventions', [SuiviInterventionController::class, 'store']);
Route::get('/suivi_interventions/{id}', [SuiviInterventionController::class, 'show']);
Route::put('/suivi_interventions/{id}', [SuiviInterventionController::class, 'update']);
Route::delete('/suivi_interventions/{id}', [SuiviInterventionController::class, 'destroy']);


Route::get('/intervenants', [IntervenantController::class, 'index']);
Route::post('/intervenants', [IntervenantController::class, 'store']);
Route::get('/intervenants/{id}', [IntervenantController::class, 'show']);
Route::put('/intervenants/{id}', [IntervenantController::class, 'update']);
Route::delete('/intervenants/{id}', [IntervenantController::class, 'destroy']);

Route::get('/agents', [AgentController::class, 'index']);
Route::post('/agents', [AgentController::class, 'store']);
Route::get('/agents/{id}', [AgentController::class, 'show']);
Route::put('/agents/{id}', [AgentController::class, 'update']);
Route::delete('/agents/{id}', [AgentController::class, 'destroy']);


Route::get('/maintenances', [MaintenanceRecordController::class, 'index']);
Route::post('/maintenances', [MaintenanceRecordController::class, 'store']);
Route::get('/maintenances/{id}', [MaintenanceRecordController::class, 'show']);
Route::put('/maintenances/{id}', [MaintenanceRecordController::class, 'update']);
Route::post('/maintenances/{id}', [MaintenanceRecordController::class, 'update']);
Route::delete('/maintenances/{id}', [MaintenanceRecordController::class, 'destroy']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chambres', [ChambreController::class, 'index']);

    Route::post('/chambres', [ChambreController::class, 'store']);
});
Route::get('/chambres', [ChambreController::class, 'index']);


Route::middleware('auth:sanctum')->post('/chambres', [ChambreController::class, 'store']);







// reclamation and departement
Route::prefix('reclamations')->group(function () {
    Route::post('/', [ReclamationController::class, 'create']);
    Route::get('/', [ReclamationController::class, 'index']);
    Route::put('/{id}', [ReclamationController::class, 'update']);
    Route::delete('/{id}', [ReclamationController::class, 'destroy']);

    // Routes for departments
    Route::get('/departements', [ReclamationController::class, 'getDepartments']);
    Route::post('/departements', [ReclamationController::class, 'addDepartment']);
    Route::put('/departements/{id}', [ReclamationController::class, 'updateDepartment']);
    Route::delete('/departements/{id}', [ReclamationController::class, 'deleteDepartment']);
});

Route::get('/chambres', [ChambreController::class, 'getAll']);
Route::post('/chambres', [ChambreController::class, 'ajouterChambre']);
Route::get('/chambres/{num_chambre}', [ChambreController::class, 'afficherChambre']);
Route::put('/chambres/{num_chambre}', [ChambreController::class, 'updateChambre']);
Route::delete('/chambres/{num_chambre}', [ChambreController::class, 'supprimerChambre']);

Route::delete('/all-chambres', [ChambreController::class, 'supprimerChambres']);

Route::get('/maintenances', [MaintenanceRecordController::class, 'index']);
Route::post('/maintenances', [MaintenanceRecordController::class, 'store']);
Route::get('/maintenances/{id}', [MaintenanceRecordController::class, 'show']);
Route::put('/maintenances/{id}', [MaintenanceRecordController::class, 'update']);
Route::post('/maintenances/{id}', [MaintenanceRecordController::class, 'update']);
Route::delete('/maintenances/{id}', [MaintenanceRecordController::class, 'destroy']);
// Get all room states


Route::get('/etat-chambre', [EtatChambreController::class, 'index']);

// Get a specific room state by room number 

Route::get('/etat-chambre/{num_chambre}', [EtatChambreController::class, 'show']);

// Create a new room state
Route::post('/etat-chambre', [EtatChambreController::class, 'store']);

// Update an existing room state by room number
Route::put('/etat-chambre/{num_chambre}', [EtatChambreController::class, 'update']);

// Delete a room state by room number
Route::delete('/etat-chambre/{num_chambre}', [EtatChambreController::class, 'destroy']);

// Get rooms with their states (custom endpoint)
Route::get('/chambres/etat', [EtatChambreController::class, 'getChambresWithEtat']);

// Add maintenance types route
Route::get('/maintenance-types', [MaintenanceTypeController::class, 'index']);

// Add maintenance types POST route
Route::post('/maintenance-types', [MaintenanceTypeController::class, 'store']);

// Add maintenance types DELETE route
Route::delete('/maintenance-types/{id}', [MaintenanceTypeController::class, 'destroy']);

// Add maintenance types PUT route
Route::put('/maintenance-types/{id}', [MaintenanceTypeController::class, 'update']);

// To store a new chambre
Route::post('chambres', [ChambreController::class, 'store']);


Route::get('/reservations', [ReservationController::class, 'getAll']);
Route::post('/reservations', [ReservationController::class, 'ajouterReservation']);
Route::get('/reservations/{reservation_number}', [ReservationController::class, 'afficherReservation']);
Route::put('/reservations/{reservation_number}', [ReservationController::class, 'updateReservation']);
Route::delete('/reservations/{reservation_number}', [ReservationController::class, 'supprimerReservation']);
Route::get('/available-rooms', [ReservationController::class, 'getAvailableRooms']);
Route::get('/reservations', [ReservationController::class, 'getReservationsByDateRange']);
Route::get('/reservations', [ReservationController::class, 'getAll']);
Route::post('/reservations', [ReservationController::class, 'ajouterReservation']);
Route::get('/reservations/{id}', [ReservationController::class, 'afficherReservation']);
Route::put('/reservations/{id}', [ReservationController::class, 'updateReservation']);
Route::delete('/reservations/{id}', [ReservationController::class, 'supprimerReservation']);

Route::get('/clients-societe', [ClientController::class, 'getSocieteClients']);
Route::get('/clients-particuliers', [ClientParticulierController::class, 'index']);
