<?php

// Point d'entrée principal pour l'API
// Ce fichier sera appelé par toutes les routes /api/*

// Désactiver l'affichage des erreurs HTML
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Gestionnaire d'erreurs global pour renvoyer du JSON
set_error_handler(function($severity, $message, $file, $line) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "Erreur PHP: $message dans $file ligne $line"
    ]);
    exit;
});

// Gestionnaire d'exceptions global
set_exception_handler(function($exception) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Exception: ' . $exception->getMessage()
    ]);
    exit;
});

try {
    // Charger l'autoloader et les dépendances
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../app/Models/Database.php';
    require_once __DIR__ . '/../app/Models/User.php';
    require_once __DIR__ . '/../app/Models/Student.php';
    require_once __DIR__ . '/../app/Models/Teacher.php';
    require_once __DIR__ . '/../app/Models/Payment.php';
    require_once __DIR__ . '/../app/Models/Depense.php';
    require_once __DIR__ . '/../app/Models/Sauvegarde.php';

    require_once __DIR__ . '/../app/Controllers/AuthController.php';
    require_once __DIR__ . '/../app/Controllers/StudentController.php';
    require_once __DIR__ . '/../app/Controllers/TeacherController.php';
    require_once __DIR__ . '/../app/Controllers/PaymentController.php';
    require_once __DIR__ . '/../app/Controllers/DepenseController.php';
    require_once __DIR__ . '/../app/Controllers/SauvegardeController.php';

    // Charger les routes
    require_once __DIR__ . '/../app/Routes/api.php';

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors du chargement: ' . $e->getMessage()
    ]);
    exit;
}