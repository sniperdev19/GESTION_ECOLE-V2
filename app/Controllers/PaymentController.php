<?php
require_once __DIR__ . '/../Models/Database.php';
class PaymentController {
    public static function index() {
        try {
            $db = Database::getInstance()->getConnection();
            $stmt = $db->query('SELECT p.*, s.first_name, s.last_name FROM payments p 
                               LEFT JOIN students s ON p.student_id = s.id 
                               ORDER BY p.payment_date DESC');
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => $payments
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
        $stmt = $db->prepare('SELECT * FROM payments WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    }
    public static function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('INSERT INTO payments (student_id, amount, date) VALUES (?, ?, ?)');
        $stmt->execute([$data['student_id'], $data['amount'], $data['date']]);
        echo json_encode(['id' => $db->lastInsertId()]);
    }
    public static function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('UPDATE payments SET student_id = ?, amount = ?, date = ? WHERE id = ?');
        $stmt->execute([$data['student_id'], $data['amount'], $data['date'], $id]);
        echo json_encode(['success' => true]);
    }
    public static function destroy($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('DELETE FROM payments WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
