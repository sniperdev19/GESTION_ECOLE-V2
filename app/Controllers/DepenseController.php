<?php

require_once __DIR__ . '/../Models/Database.php';
require_once __DIR__ . '/../Models/Depense.php';

class DepenseController {
    
    public static function index() {
        try {
            $depenseModel = new Depense();
            $depenses = $depenseModel->getAll();
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $depenses
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ]);
        }
    }
    
    public static function show($id) {
        try {
            $depenseModel = new Depense();
            $depense = $depenseModel->getById($id);
            
            if (!$depense) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Dépense non trouvée'
                ]);
                return;
            }
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $depense
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ]);
        }
    }
    
    public static function store() {
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Données JSON invalides'
                ]);
                return;
            }
            
            // Validation des champs obligatoires
            $required = ['expense_date', 'category', 'description', 'amount'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => "Le champ {$field} est obligatoire"
                    ]);
                    return;
                }
            }
            
            $depenseModel = new Depense();
            $success = $depenseModel->create($data);
            
            if ($success) {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'Dépense créée avec succès'
                ]);
            } else {
                throw new Exception('Erreur lors de la création');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ]);
        }
    }
    
    public static function update($id) {
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Données JSON invalides'
                ]);
                return;
            }
            
            $depenseModel = new Depense();
            $success = $depenseModel->update($id, $data);
            
            if ($success) {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'Dépense mise à jour avec succès'
                ]);
            } else {
                throw new Exception('Erreur lors de la mise à jour');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ]);
        }
    }
    
    public static function destroy($id) {
        try {
            $depenseModel = new Depense();
            $success = $depenseModel->delete($id);
            
            if ($success) {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => 'Dépense supprimée avec succès'
                ]);
            } else {
                throw new Exception('Erreur lors de la suppression');
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ]);
        }
    }
}
