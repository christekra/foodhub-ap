<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Gestion personnalisée des erreurs pour l'API
        $this->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    /**
     * Gestion personnalisée des exceptions pour l'API
     */
    protected function handleApiException(Throwable $e, $request): JsonResponse
    {
        $status = 500;
        $message = 'Erreur interne du serveur';
        $errors = null;

        // Gestion des différents types d'exceptions
        if ($e instanceof ValidationException) {
            $status = 422;
            $message = 'Erreurs de validation';
            $errors = $e->errors();
        } elseif ($e instanceof AuthenticationException) {
            $status = 401;
            $message = 'Non authentifié';
        } elseif ($e instanceof ModelNotFoundException) {
            $status = 404;
            $message = 'Ressource non trouvée';
        } elseif ($e instanceof NotFoundHttpException) {
            $status = 404;
            $message = 'Route non trouvée';
        } elseif ($e instanceof HttpException) {
            $status = $e->getStatusCode();
            $message = $e->getMessage();
        }

        // En mode debug, inclure plus d'informations
        if (config('app.debug')) {
            $response = [
                'success' => false,
                'message' => $message,
                'status' => $status,
                'errors' => $errors,
                'debug' => [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]
            ];
        } else {
            $response = [
                'success' => false,
                'message' => $message,
                'status' => $status,
            ];

            if ($errors) {
                $response['errors'] = $errors;
            }
        }

        return response()->json($response, $status);
    }
}
