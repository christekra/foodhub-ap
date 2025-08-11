<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'delivery_user_id',
        'latitude',
        'longitude',
        'location_address',
        'recorded_at'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'recorded_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function deliveryUser()
    {
        return $this->belongsTo(User::class, 'delivery_user_id');
    }
} 