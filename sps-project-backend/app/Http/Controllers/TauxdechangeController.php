<?php
namespace App\Http\Controllers;
use App\Models\TauxEchange;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Validator;
class TauxdechangeController extends Controller
{
    public function index(request $request){
       
        $taux = TauxEchange::all();
        return response()->json([
            'TauxDeChange' => $taux,
        ]); 
    }
    public function store(Request $request)
    {
        // Validation de la requête avec validation conditionnelle de 'date_d' si 'source' est 'manual'
        $validated = $request->validate([
            'id_de_monnaie_de_change' => 'required|exists:devises,id', 
            'id_de_monnaie_a_change' => 'required|exists:devises,id',
            'taux' => 'required|numeric',
            'date_d' => 'nullable|date|required_if:source,manuelle', // 'date_d' requise si 'source' est 'manual'
            'date_f' => 'nullable|date',
            'source' => 'nullable|in:automatique,manuelle',
        ]);
    
        // Si le champ 'source' n'est pas envoyé, on lui attribue la valeur par défaut 'api'
        $source = $request->input('source', 'automatique');
    
        // Création du taux de change
        $taux_echange = new TauxDeChange([
            'id_de_monnaie_de_change' => $validated['id_de_monnaie_de_change'],
            'id_de_monnaie_a_change' => $validated['id_de_monnaie_a_change'],
            'taux' => $validated['taux'],
            'date_d' => $validated['date_d'],
            'date_f' => $validated['date_f'],
            'source' => $source, 
        ]);
    
        // Sauvegarde en base de données
        $taux_echange->save();
    
        return response()->json($taux_echange, 201);
    }
    

    public function updeta(request $request, $id){
        { $validated = $request->validate([
            'id_de_monnaie_de_change' => 'required|exists:devises,id', 
            'id_de_monnaie_a_change' => 'required|exists:devises,id',
            'taux' => 'required|numeric',
            'date_d' => 'nullable|date|required_if:source,manual', // 'date_d' requise si 'source' est 'manual'
            'date_f' => 'nullable|date',
            'source' => 'nullable|in:automatique,manuelle',
        ]);
    
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
    
        $taux = TauxDeChange::findOrFail($id);
    
        // Mise à jour des données
        $taux->id_de_monnaie_de_change = $request->input('id_de_monnaie_de_change');
        $taux->id_de_monnaie_a_change = $request->input('id_de_monnaie_a_change'); 
        $taux->taux = $request->input('taux');
        $taux->source = $request->input('source');
        $taux->date_d = $request->input('date_d');
        $taux->date_f = $request->input('date_f');
        ;
    
        // Sauvegarder les changements
        $taux->save();
    
        // Retourner une réponse JSON après la mise à jour
        return response()->json(['message' => 'Modification réussie avec succès'], 200);
    } 
}
}