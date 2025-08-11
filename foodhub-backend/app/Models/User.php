<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'account_type',
        'status',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Get the orders for the user.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the reviews for the user.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the vendor profile for the user.
     */
    public function vendor()
    {
        return $this->hasOne(Vendor::class, 'user_id');
    }

    /**
     * Get the client profile for the user.
     */
    public function client()
    {
        return $this->hasOne(Client::class, 'user_id');
    }

    /**
     * Get vendor applications for the user.
     */
    public function vendorApplications()
    {
        return $this->hasMany(VendorApplication::class);
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin()
    {
        return $this->is_admin || $this->account_type === 'admin';
    }

    /**
     * Check if user is vendor.
     */
    public function isVendor()
    {
        return $this->account_type === 'vendor';
    }

    /**
     * Check if user is client.
     */
    public function isClient()
    {
        return $this->account_type === 'client';
    }

    /**
     * Check if user account is active.
     */
    public function isActive()
    {
        return $this->status === 'active';
    }
}
