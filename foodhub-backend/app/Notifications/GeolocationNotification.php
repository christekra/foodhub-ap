<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class GeolocationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $notificationData;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $notificationData)
    {
        $this->notificationData = $notificationData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $data = $this->notificationData;
        
        $mailMessage = (new MailMessage)
            ->subject($data['title'])
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line($data['body']);

        // Ajouter des informations contextuelles selon le type
        switch ($data['type']) {
            case 'vendor_nearby':
                $mailMessage->line('Découvrez ce nouveau restaurant et ses spécialités !')
                    ->action('Voir le restaurant', url('/vendors/' . $data['data']['vendor_id']));
                break;
                
            case 'delivery_update':
                $mailMessage->line('Suivez votre commande en temps réel.')
                    ->action('Suivre ma commande', url('/orders/' . $data['data']['order_id']));
                break;
                
            case 'promotional_offer':
                $mailMessage->line('Ne manquez pas cette offre spéciale !')
                    ->action('Voir l\'offre', url('/vendors/' . $data['data']['vendor_id']));
                break;
                
            case 'weather_alert':
                $mailMessage->line('Restez informé des conditions météorologiques.')
                    ->action('Voir les détails', url('/weather-alerts'));
                break;
                
            case 'traffic_alert':
                $mailMessage->line('Informations importantes sur le trafic dans votre zone.')
                    ->action('Voir les détails', url('/traffic-alerts'));
                break;
        }

        return $mailMessage->salutation('Cordialement, l\'équipe DjassaFood');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => $this->notificationData['type'],
            'title' => $this->notificationData['title'],
            'body' => $this->notificationData['body'],
            'data' => $this->notificationData['data'],
            'read_at' => null,
            'created_at' => now()->toISOString(),
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => $this->notificationData['type'],
            'title' => $this->notificationData['title'],
            'body' => $this->notificationData['body'],
            'data' => $this->notificationData['data'],
            'timestamp' => now()->toISOString(),
            'user_id' => $notifiable->id,
        ]);
    }

    /**
     * Get the notification's unique identifier.
     */
    public function id(): string
    {
        return 'geolocation_' . $this->notificationData['type'] . '_' . time();
    }

    /**
     * Determine which queues should be used for each notification channel.
     */
    public function viaQueues(): array
    {
        return [
            'mail' => 'emails',
            'database' => 'notifications',
            'broadcast' => 'broadcasts',
        ];
    }

    /**
     * Determine if the notification should be sent.
     */
    public function shouldSend(object $notifiable): bool
    {
        // Vérifier si l'utilisateur a activé les notifications de géolocalisation
        if (method_exists($notifiable, 'settings')) {
            $settings = $notifiable->settings;
            if (isset($settings['geolocation_notifications']) && !$settings['geolocation_notifications']) {
                return false;
            }
        }

        // Vérifier si l'utilisateur est actif
        if ($notifiable->status !== 'active') {
            return false;
        }

        return true;
    }

    /**
     * Get the notification's database type.
     */
    public function getDatabaseType(): string
    {
        return 'geolocation';
    }

    /**
     * Get the notification's broadcast channels.
     */
    public function broadcastChannels(object $notifiable): array
    {
        return [
            'user.' . $notifiable->id,
            'geolocation.' . $this->notificationData['type'],
        ];
    }

    /**
     * Get the notification's broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'geolocation.notification';
    }

    /**
     * Get the notification's broadcast queue.
     */
    public function broadcastQueue(): string
    {
        return 'broadcasts';
    }

    /**
     * Get the notification's broadcast delay.
     */
    public function broadcastDelay(): int
    {
        // Délai de 5 secondes pour éviter le spam
        return 5;
    }

    /**
     * Get the notification's broadcast options.
     */
    public function broadcastOptions(): array
    {
        return [
            'priority' => 'high',
            'ttl' => 3600, // 1 heure
        ];
    }
}
