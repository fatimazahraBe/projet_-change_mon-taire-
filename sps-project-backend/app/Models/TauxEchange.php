<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class TauxEchange extends Model
{
    use HasFactory;
    protected $table = 'taux_echange';
    protected $fillable = ['id_de_monnaie_de_change', 'id_de_monnaie_a_change', 'taux', 'source', 'date_d', 'date_f'];

    public function fromCurrency()
    {
        return $this->belongsTo(devises::class, 'id_de_monnaie_de_change');
    }

    public function toCurrency()
    {
        return $this->belongsTo(devises::class, 'id_de_monnaie_a_change');
    }
}

