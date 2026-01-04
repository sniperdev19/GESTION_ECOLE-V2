<?php

class Depense {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getAll() {
        $query = "SELECT * FROM expenses ORDER BY expense_date DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $query = "SELECT * FROM expenses WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $query = "INSERT INTO expenses (expense_date, category, description, amount, payment_method, provider, invoice_number, status, notes) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            $data['expense_date'],
            $data['category'],
            $data['description'],
            $data['amount'],
            $data['payment_method'] ?? 'cash',
            $data['provider'] ?? null,
            $data['invoice_number'] ?? null,
            $data['status'] ?? 'paid',
            $data['notes'] ?? null
        ]);
    }
    
    public function update($id, $data) {
        $query = "UPDATE expenses SET 
                  expense_date = ?, category = ?, description = ?, amount = ?, 
                  payment_method = ?, provider = ?, invoice_number = ?, status = ?, notes = ?,
                  updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            $data['expense_date'],
            $data['category'],
            $data['description'],
            $data['amount'],
            $data['payment_method'],
            $data['provider'],
            $data['invoice_number'],
            $data['status'],
            $data['notes'],
            $id
        ]);
    }
    
    public function delete($id) {
        $query = "DELETE FROM expenses WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$id]);
    }
    
    public function getTotalAmount() {
        $query = "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = 'paid'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'];
    }
    
    public function getMonthlyExpenses($year, $month) {
        $query = "SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
                  WHERE status = 'paid' AND YEAR(expense_date) = ? AND MONTH(expense_date) = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$year, $month]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'];
    }
}
