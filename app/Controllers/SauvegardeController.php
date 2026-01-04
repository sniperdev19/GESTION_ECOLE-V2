<?php
class SauvegardeController {
    public static function backup() {
        // À adapter selon l'environnement (exemple basique)
        $filename = 'sauvegarde_' . date('Ymd_His') . '.sql';
        $command = "mysqldump -u root gestion_ecole > ../backups/$filename";
        system($command, $retval);
        if ($retval === 0) {
            echo json_encode(['success' => true, 'file' => $filename]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erreur de sauvegarde']);
        }
    }
}
