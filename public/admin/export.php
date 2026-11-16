<?php
require_once __DIR__ . '/auth.php';
require_login();

$pdo = get_db();

$type = $_GET['type'] ?? '';
$status = $_GET['status'] ?? '';

$sql = "SELECT * FROM leads WHERE 1=1";
$params = [];

if (!empty($type) && $type !== 'all') {
    $sql .= " AND form_type = :type";
    $params[':type'] = $type;
}
if (!empty($status) && $status !== 'all') {
    $sql .= " AND status = :status";
    $params[':status'] = $status;
}

$sql .= " ORDER BY id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$leads = $stmt->fetchAll();

$filename = 'leads_elitesce_' . date('Y-m-d_His') . '.csv';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

$output = fopen('php://output', 'w');

// UTF-8 BOM for Microsoft Excel compatibility
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// CSV Header
fputcsv($output, [
    'ID',
    'Date de création',
    'Type de formulaire',
    'Nom & Prénom',
    'Entreprise / Marque',
    'Téléphone / WhatsApp',
    'Email',
    'Service / Plan',
    'Budget',
    'Détails & Message',
    'Données supplémentaires',
    'Statut',
    'Notes Administrateur',
    'Adresse IP'
], ';');

foreach ($leads as $l) {
    fputcsv($output, [
        $l['id'],
        $l['created_at'],
        $l['form_type'],
        $l['name'],
        $l['company'],
        $l['phone'],
        $l['email'],
        $l['service_or_plan'],
        $l['budget'],
        $l['details'],
        $l['extra_data'],
        $l['status'],
        $l['admin_notes'],
        $l['ip_address']
    ], ';');
}

fclose($output);
exit;
