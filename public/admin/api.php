<?php
require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

if (!is_logged_in()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé']);
    exit;
}

$pdo = get_db();

// Supports JSON body or POST
$raw = file_get_contents('php://input');
$json = json_decode($raw, true);
$data = is_array($json) ? $json : $_POST;

$action = $data['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'update_status':
        $id = (int)($data['id'] ?? 0);
        $status = trim($data['status'] ?? '');
        $allowed = ['nouveau', 'contacte', 'en_cours', 'conclu', 'archive'];
        if ($id <= 0 || !in_array($status, $allowed)) {
            echo json_encode(['success' => false, 'error' => 'Paramètres invalides']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE leads SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        echo json_encode(['success' => true, 'id' => $id, 'status' => $status]);
        break;

    case 'update_notes':
        $id = (int)($data['id'] ?? 0);
        $notes = trim($data['notes'] ?? '');
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID invalide']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE leads SET admin_notes = :notes, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
        $stmt->execute([':notes' => $notes, ':id' => $id]);
        echo json_encode(['success' => true, 'id' => $id, 'notes' => $notes]);
        break;

    case 'delete_lead':
        $id = (int)($data['id'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID invalide']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM leads WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['success' => true, 'deleted_id' => $id]);
        break;

    case 'get_lead':
        $id = (int)($data['id'] ?? $_GET['id'] ?? 0);
        if ($id <= 0) {
            echo json_encode(['success' => false, 'error' => 'ID invalide']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $lead = $stmt->fetch();
        if ($lead) {
            echo json_encode(['success' => true, 'lead' => $lead]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Lead introuvable']);
        }
        break;

    case 'change_password':
        $user_id = $_SESSION['elite_admin_id'];
        $current = $data['current_password'] ?? '';
        $new_pass = $data['new_password'] ?? '';

        if (empty($current) || empty($new_pass) || strlen($new_pass) < 6) {
            echo json_encode(['success' => false, 'error' => 'Le nouveau mot de passe doit contenir au moins 6 caractères.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT password_hash FROM admin_users WHERE id = :id");
        $stmt->execute([':id' => $user_id]);
        $hash = $stmt->fetchColumn();

        if (!$hash || !password_verify($current, $hash)) {
            echo json_encode(['success' => false, 'error' => 'Mot de passe actuel incorrect.']);
            exit;
        }

        $new_hash = password_hash($new_pass, PASSWORD_BCRYPT, ['cost' => 12]);
        $upd = $pdo->prepare("UPDATE admin_users SET password_hash = :p WHERE id = :id");
        $upd->execute([':p' => $new_hash, ':id' => $user_id]);

        echo json_encode(['success' => true, 'message' => 'Mot de passe mis à jour avec succès !']);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Action inconnue']);
        break;
}
