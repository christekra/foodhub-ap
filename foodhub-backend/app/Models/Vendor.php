<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'logo',
        'cover_image',
        'opening_time',
        'closing_time',
        'is_open',
        'rating',
        'review_count',
        'delivery_fee',
        'delivery_time',
        'minimum_order',
        'is_verified',
        'is_featured',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'opening_time' => 'datetime:H:i',
        'closing_time' => 'datetime:H:i',
        'is_open' => 'boolean',
        'rating' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'minimum_order' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Get the dishes for the vendor.
     */
    public function dishes()
    {
        return $this->hasMany(Dish::class);
    }

    /**
     * Get the orders for the vendor.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the reviews for the vendor.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the user that owns the vendor.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include open vendors.
     */
    public function scopeOpen($query)
    {
        return $query->where('is_open', true);
    }

    /**
     * Scope a query to only include featured vendors.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include verified vendors.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Get formatted opening time.
     */
    public function getFormattedOpeningTimeAttribute()
    {
        return $this->opening_time ? $this->opening_time->format('H:i') : null;
    }

    /**
     * Get formatted closing time.
     */
    public function getFormattedClosingTimeAttribute()
    {
        return $this->closing_time ? $this->closing_time->format('H:i') : null;
    }
}
