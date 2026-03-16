<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Verificar si existe token en sesión o en cookies
        if (!session()->has('auth_token') && !$request->hasCookie('auth_token')) {
            // Redirigir a login si no está autenticado
            return redirect('/login')->with('message', 'Debes iniciar sesión para acceder');
        }

        $response = $next($request);

        // Impedir que el navegador cachee páginas protegidas.
        // Así, al presionar Atrás después de cerrar sesión,
        // el navegador solicita la página al servidor y este redirige al login.
        return $response
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
