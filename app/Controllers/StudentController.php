<?php

require_once __DIR__ . '/../Models/Database.php';

class StudentController {
    
    public static function index() {
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->query('SELECT * FROM students ORDER BY created_at DESC');
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $students
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
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
            $stmt->execute([$id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$student) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Étudiant non trouvé'
                ]);
                return;
            }
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $student
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
            
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare('INSERT INTO students (first_name, last_name, email, phone, class, total_amount, remaining_amount) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $data['first_name'],
                $data['last_name'], 
                $data['email'],
                $data['phone'],
                $data['class'],
                $data['total_amount'] ?? 0,
                $data['remaining_amount'] ?? 0
            ]);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => ['id' => $db->lastInsertId()]
            ]);
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
            
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare('UPDATE students SET first_name = ?, last_name = ?, email = ?, phone = ?, class = ?, 
                                  total_amount = ?, remaining_amount = ? WHERE id = ?');
            $stmt->execute([
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone'],
                $data['class'],
                $data['total_amount'],
                $data['remaining_amount'],
                $id
            ]);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Étudiant mis à jour avec succès'
            ]);
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
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare('DELETE FROM students WHERE id = ?');
            $stmt->execute([$id]);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Étudiant supprimé avec succès'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ]);
        }
    }
}
