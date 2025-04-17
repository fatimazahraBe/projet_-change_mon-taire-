<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class definie_prix extends Model
{

    use HasFactory;
    protected $table = 'definie_prixes';
    protected $fillable = [
        'devseID',
        'prix_achat', 
       'prix_vente',
       'date_d',
       'date_f',
    ];

    public function deviseID()
    {
        return $this->belongsTo(Devise::class, 'devseID'); 
    }

    
}
