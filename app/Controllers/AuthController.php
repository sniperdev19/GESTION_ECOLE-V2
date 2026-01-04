<?php
require_once __DIR__ . '/../Models/Database.php';

class AuthController {
    public static function login() {
        try {
            // Récupérer les données JSON
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Validation des données
            if (!$data || !isset($data['username']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Username et password requis']);
                return;
            }
            
            $username = trim($data['username']);
            $password = trim($data['password']);
            
            if (empty($username) || empty($password)) {
                http_response_code(400);
                echo json_encode(['error' => 'Username et password ne peuvent pas être vides']);
                return;
            }
            
            // Pour le moment, utiliser des identifiants par défaut
            // À améliorer avec une vraie table users et hash des mots de passe
            if ($username === 'admin' && $password === 'admin123') {
                $token = base64_encode($username . '|' . time());
                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => ['username' => $username]
                ]);
                return;
            }
            
            // Tentative de connexion avec la base de données (si la table users existe)
            try {
                $db = Database::getInstance()->getConnection();
                $stmt = $db->prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
                $stmt->execute([$username]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user && password_verify($password, $user['password'])) {
                    $token = base64_encode($user['username'] . '|' . time());
                    echo json_encode([
                        'success' => true,
                        'token' => $token,
                        'user' => ['username' => $user['username']]
                    ]);
                    return;
                }
            } catch (Exception $e) {
                // La table users n'existe probablement pas, continuer avec admin par défaut
            }
            
            http_response_code(401);
            echo json_encode(['error' => 'Identifiants invalides']);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
        }
    }
}
