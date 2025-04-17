<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EchangeDevise extends Model
{

    protected $table="echanges_devise";
    
    protected $fillable = [
        'type_echange',
        'id_devise',
        'id_prix',
        'montant',
        'status',
        'date_transaction',
        'montant_converti'
    ];
    
    public function devise()
    {
        return $this->belongsTo(Devise::class, 'id_devise');
    }
    
    public function prix()
    {
        return $this->belongsTo(definie_prix::class, 'id_prix');
    }
}

