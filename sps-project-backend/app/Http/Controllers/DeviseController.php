<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\Devise;

class DeviseController extends Controller
{
    public function index()
    {
        $devises = Devise::all();
        return response()->json([
            'devises' => $devises,
        ]);
    }

    public function store(Request $request)
    {
        Devise::create($request->all());
        return response()->json(['message' => 'Ajouté avec succès']);
    }

    public function update (Request $request ,$id)
    { $validator = Validator::make($request->all(), [
        'code' => 'required|string|max:3',  // Correction de 'sting' en 'string'
        'name' => 'required|string|max:255',
        'symbol' => 'required|string|max:10',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->withErrors($validator)->withInput();
    }

    $devis = Devise::findOrFail($id);

    // Mise à jour des données
    $devis->code = $request->input('code');
    $devis->name = $request->input('name');  // Corrigé 'name' en 'nom'
    $devis->symbol = $request->input('symbol');  // Corrigé 'symbol' en 'symbole'

    // Sauvegarder les changements
    $devis->save();

    // Retourner une réponse JSON après la mise à jour
    return response()->json(['message' => 'Modification réussie avec succès'], 200);
    }
    
}

