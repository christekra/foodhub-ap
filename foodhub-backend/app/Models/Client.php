<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'address',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'avatar',
        'status',
        'notes',
        'last_order_at',
        'total_orders',
        'total_spent',
    ];

    protected $casts = [
        'last_order_at' => 'datetime',
        'total_orders' => 'integer',
        'total_spent' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id', 'user_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    public function scopeBanned($query)
    {
        return $query->where('status', 'banned');
    }

    // Méthodes
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isSuspended()
    {
        return $this->status === 'suspended';
    }

    public function isBanned()
    {
        return $this->status === 'banned';
    }

    public function getAverageOrderValueAttribute()
    {
        return $this->total_orders > 0 ? $this->total_spent / $this->total_orders : 0;
    }
}
