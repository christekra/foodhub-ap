<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vendor_id',
        'order_number',
        'status',
        'subtotal',
        'delivery_fee',
        'tax',
        'total',
        'delivery_address',
        'delivery_city',
        'delivery_postal_code',
        'delivery_latitude',
        'delivery_longitude',
        'customer_name',
        'customer_phone',
        'special_instructions',
        'payment_method',
        'payment_status',
        'estimated_delivery_time',
        'delivered_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'delivery_latitude' => 'decimal:8',
        'delivery_longitude' => 'decimal:8',
        'estimated_delivery_time' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    protected $appends = [
        'status_label',
        'status_color',
        'next_possible_statuses'
    ];

    /**
     * Get the user that owns the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vendor that owns the order.
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function tracking()
    {
        return $this->hasMany(OrderTracking::class);
    }

    public function deliveryLocations()
    {
        return $this->hasMany(DeliveryLocation::class);
    }

    public function latestTracking()
    {
        return $this->hasOne(OrderTracking::class)->latest();
    }

    public function latestDeliveryLocation()
    {
        return $this->hasOne(DeliveryLocation::class)->latest();
    }

    /**
     * Get the reviews for the order.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Scope a query to only include pending orders.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include confirmed orders.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope a query to only include delivered orders.
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * Scope a query to only include cancelled orders.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to only include preparing orders.
     */
    public function scopePreparing($query)
    {
        return $query->where('status', 'preparing');
    }

    /**
     * Scope a query to only include ready orders.
     */
    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    /**
     * Scope a query to only include out for delivery orders.
     */
    public function scopeOutForDelivery($query)
    {
        return $query->where('status', 'out_for_delivery');
    }

    /**
     * Check if order is pending.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if order is confirmed.
     */
    public function isConfirmed()
    {
        return $this->status === 'confirmed';
    }

    /**
     * Check if order is preparing.
     */
    public function isPreparing()
    {
        return $this->status === 'preparing';
    }

    /**
     * Check if order is ready.
     */
    public function isReady()
    {
        return $this->status === 'ready';
    }

    /**
     * Check if order is out for delivery.
     */
    public function isOutForDelivery()
    {
        return $this->status === 'out_for_delivery';
    }

    /**
     * Check if order is delivered.
     */
    public function isDelivered()
    {
        return $this->status === 'delivered';
    }

    /**
     * Check if order is cancelled.
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if order is refunded.
     */
    public function isRefunded()
    {
        return $this->status === 'refunded';
    }

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed', 'preparing']);
    }

    /**
     * Get status label in French.
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            'pending' => 'En attente',
            'confirmed' => 'Confirmée',
            'preparing' => 'En préparation',
            'ready' => 'Prête',
            'out_for_delivery' => 'En livraison',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée',
            'refunded' => 'Remboursée'
        ];

        return $labels[$this->status] ?? $this->status;
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'preparing' => 'orange',
            'ready' => 'green',
            'out_for_delivery' => 'purple',
            'delivered' => 'green',
            'cancelled' => 'red',
            'refunded' => 'gray'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Get next possible statuses.
     */
    public function getNextPossibleStatusesAttribute()
    {
        $nextStatuses = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['preparing', 'cancelled'],
            'preparing' => ['ready', 'cancelled'],
            'ready' => ['out_for_delivery', 'cancelled'],
            'out_for_delivery' => ['delivered', 'cancelled'],
            'delivered' => ['refunded'],
            'cancelled' => [],
            'refunded' => []
        ];

        return $nextStatuses[$this->status] ?? [];
    }
}
