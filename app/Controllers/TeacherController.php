<?php
require_once __DIR__ . '/../Models/Database.php';
class TeacherController {
    public static function index() {
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->query('SELECT * FROM teachers ORDER BY created_at DESC');
            $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $teachers
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
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT * FROM teachers WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    }
    public static function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('INSERT INTO teachers (name, email) VALUES (?, ?)');
        $stmt->execute([$data['name'], $data['email']]);
        echo json_encode(['id' => $db->lastInsertId()]);
    }
    public static function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('UPDATE teachers SET name = ?, email = ? WHERE id = ?');
        $stmt->execute([$data['name'], $data['email'], $id]);
        echo json_encode(['success' => true]);
    }
    public static function destroy($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('DELETE FROM teachers WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
