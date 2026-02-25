<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// ===============================
// RUTAS PÚBLICAS (accesibles sin autenticación)
// ===============================

Route::get('/login', function () {
    // Si ya hay token, redirigir a módulos
    if (session()->has('auth_token') || request()->cookie('auth_token')) {
        return redirect('/modulos');
    }
    return view('login');
})->name('login');

Route::get('/register', function () {
    // Si ya hay token, redirigir a módulos
    if (session()->has('auth_token') || request()->cookie('auth_token')) {
        return redirect('/modulos');
    }
    return view('register');
})->name('register');

Route::get('/recuperar', function () {
    return view('recuperar');
});

Route::get('/reset-password', function () {
    return view('nueva_contrasena');
})->name('password.reset');

Route::get('/enlace', function () {
    return view('enlace');
});

    Route::get('/', function () {
        return view('dashboard');
    });

// ===============================
// RUTAS PROTEGIDAS (requieren autenticación)
// ===============================

Route::middleware('auth')->group(function () {
    Route::get('/modulos', function () {
        return view('modulos');
    })->name('modulos');

    Route::get('/modulo', function () {
        return view('modulo');
    })->name('modulo');

    Route::get('/modulo/{slug}', function ($slug) {
        return view('modulo', ['slug' => $slug]);
    })->name('modulo.detalle');


    Route::get('/perfil', function () {
        return view('perfil');
    });

    Route::get('/contrasena_actualizada', function () {
        return view('contrasena_actualizada');
    });
});

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
    session()->forget('auth_token');
    return response()->json(['success' => true]);
});



