<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// ===============================
// RUTAS PÚBLICAS (accesibles sin autenticación)
// ===============================

// La raíz siempre redirige al dashboard (página principal pública)
Route::get('/', function () {
    return redirect('/dashboard');
});

// Dashboard público - no requiere autenticación
Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

// ===============================
// Login, Registro y Recuperación de Contraseña
// ===============================

Route::get('/login{slash?}', function ($slash = null) {
    if (session()->has('auth_token') || request()->cookie('auth_token')) {
        return redirect('/modulos');
    }
    return view('login');
})->where('slash', '\/?')->name('login');

Route::get('/register{slash?}', function ($slash = null) {
    if (session()->has('auth_token') || request()->cookie('auth_token')) {
        return redirect('/modulos');
    }
    return view('register');
})->where('slash', '\/?')->name('register');


Route::get('/recuperar', function () {
    return view('recuperar');
});
Route::get('/enlace', function () {
    return view('enlace');
});


Route::get('/reset-password', function () {
    return view('nueva_contrasena');
})->name('password.reset');

Route::get('/terminos', function () {
    return view('terminos');
})->name('terminos');

// ===============================
// RUTAS PROTEGIDAS (requieren token de sesión)
// ===============================

Route::middleware('auth')->group(function () {
    Route::get(
        '/modulos',
        function () {
            return view('modulo');
        }
        )->name('modulos');

        Route::get(
            '/modulo/{slug}',
            function ($slug) {
            return view('modulo', ['slug' => $slug]);
        }
        )->name('modulo.detalle');

        // Perfil: protegido por sesión Laravel
        Route::get(
            '/perfil',
            function () {
            return view('perfil');
        }
        )->name('perfil');    });

// ===============================
// API LOCAL PARA MANEJAR SESIÓN
// ===============================

Route::post('/api/set-session-token', function (Request $request) {
    $token = $request->token;
    if ($token) {
        session(['auth_token' => $token]);
        return response()->json(['success' => true]);
    }
    return response()->json(['success' => false], 400);
});

Route::post('/api/clear-session-token', function () {
    // Invalidar completamente la sesión de Laravel
    session()->flush();
    session()->invalidate();
    session()->regenerateToken();
    return response()->json(['success' => true]);
});
