<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return view('login');
});

Route::get('/contrasena_actualizada', function () {
    return view('contrasena_actualizada');
});

Route::get('/enlace', function () {
    return view('enlace');
});

Route::get('/recuperar', function () {
    return view('recuperar');
});

Route::get('/nueva_contrasena', function () {
    return view('nueva_contrasena');
});

Route::get('/recuperar', function () {
    return view('recuperar');
});
