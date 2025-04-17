<?php

namespace App\Http\Controllers;
use App\Models\ClientDeChange;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class ClientsEchngeController extends Controller
{
    public function index()
    {
        $clients =ClientDeChange::all();
        return response()->json([
            'ClientDeChange' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        ClientDeChange::create($request->all());
        return response()->json(['message' => 'Ajouté avec succès']);
    }

    public function update (Request $request ,$id)
    { $validator = Validator::make($request->all(), [
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'CIN' => 'required|string|max:8|unique:clients_de_changes,CIN',
        'nationnalite'=>'required|string|max:255',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->withErrors($validator)->withInput();
    }

    $clients= ClientDeChange::findOrFail($id);


    $clients->nom = $request->input('nom');
    $clients->prenom = $request->input('prenom');  
    $clients->CIN = $request->input('CIN');  
    $clients->nationnalite = $request->input('nationnalite');  

  
    $clients->save();

    
    return response()->json(['message' => 'Modification réussie avec succès'], 200);
    }
    
}
