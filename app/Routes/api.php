<?php
// Définition des routes de l'API
header('Content-Type: application/json; charset=utf-8');

try {
    // Récupérer la route depuis les paramètres GET ou l'URL
    $route = $_GET['route'] ?? '';
    
    // Si pas de paramètre route, essayer de parser l'URL
    if (!$route) {
        $requestUri = $_SERVER['REQUEST_URI'];
        $requestPath = parse_url($requestUri, PHP_URL_PATH);
        
        // Nettoyer le chemin et diviser en segments
        $path = trim($requestPath, '/');
        $segments = explode('/', $path);
        
        // Retirer 'api' du début si présent
        if (isset($segments[0]) && $segments[0] === 'api') {
            array_shift($segments);
        }
        
        // Retirer les segments vides
        $segments = array_filter($segments);
        $segments = array_values($segments); // Réindexer
        
        $route = isset($segments[0]) ? $segments[0] : '';
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    $resource = $route;
    $id = $_GET['id'] ?? null;
    
    // Route authentification
    if ($resource === 'login' && $method === 'POST') {
        require_once __DIR__ . '/../Controllers/AuthController.php';
        AuthController::login();
        exit;
    }
    
    // Routes students
    if ($resource === 'students') {
        require_once __DIR__ . '/../Controllers/StudentController.php';
        
        switch ($method) {
            case 'GET':
                if ($id) {
                    StudentController::show($id);
                } else {
                    StudentController::index();
                }
                break;
            case 'POST':
                StudentController::store();
                break;
            case 'PUT':
                if ($id) {
                    StudentController::update($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la mise à jour']);
                }
                break;
            case 'DELETE':
                if ($id) {
                    StudentController::destroy($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la suppression']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
        exit;
    }
    
    // Routes teachers
    if ($resource === 'teachers') {
        require_once __DIR__ . '/../Controllers/TeacherController.php';
        
        switch ($method) {
            case 'GET':
                if ($id) {
                    TeacherController::show($id);
                } else {
                    TeacherController::index();
                }
                break;
            case 'POST':
                TeacherController::store();
                break;
            case 'PUT':
                if ($id) {
                    TeacherController::update($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la mise à jour']);
                }
                break;
            case 'DELETE':
                if ($id) {
                    TeacherController::destroy($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la suppression']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
        exit;
    }
    
    // Routes payments
    if ($resource === 'payments') {
        require_once __DIR__ . '/../Controllers/PaymentController.php';
        
        switch ($method) {
            case 'GET':
                if ($id) {
                    PaymentController::show($id);
                } else {
                    PaymentController::index();
                }
                break;
            case 'POST':
                PaymentController::store();
                break;
            case 'PUT':
                if ($id) {
                    PaymentController::update($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la mise à jour']);
                }
                break;
            case 'DELETE':
                if ($id) {
                    PaymentController::destroy($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la suppression']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
        exit;
    }
    
    // Routes depenses
    if ($resource === 'depenses') {
        require_once __DIR__ . '/../Controllers/DepenseController.php';
        
        switch ($method) {
            case 'GET':
                if ($id) {
                    DepenseController::show($id);
                } else {
                    DepenseController::index();
                }
                break;
            case 'POST':
                DepenseController::store();
                break;
            case 'PUT':
                if ($id) {
                    DepenseController::update($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la mise à jour']);
                }
                break;
            case 'DELETE':
                if ($id) {
                    DepenseController::destroy($id);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID requis pour la suppression']);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
        exit;
    }
    
    // Route sauvegarde
    if ($resource === 'sauvegarde' && $method === 'POST') {
        require_once __DIR__ . '/../Controllers/SauvegardeController.php';
        SauvegardeController::backup();
        exit;
    }
    
    // Aucune route trouvée
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint non trouvé', 'resource' => $resource, 'method' => $method]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
