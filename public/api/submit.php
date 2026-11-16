<?php
/**
 * Elite Service - Form Submission Endpoint
 * Receives all form leads (ERP Demo, Sponsoring, Devis, Newsletter) and saves to database.
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Allow same origin and elitesce.com domains
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://www.elitesce.com',
    'https://elitesce.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/db.php';

// Parse input (supports JSON, FormData, x-www-form-urlencoded)
$raw_input = file_get_contents('php://input');
$json_data = json_decode($raw_input, true);
$data = is_array($json_data) ? $json_data : $_POST;

// 1. Anti-spam Honeypot Check
if (!empty($data['website_hp']) || !empty($data['_gotcha']) || !empty($data['elite_hp'])) {
    // Silently succeed for bots
    echo json_encode(['success' => true, 'message' => 'Demande reçue.']);
    exit;
}

// 2. Extract and Sanitize Fields
$form_type = trim($data['form_type'] ?? 'devis');
if (!in_array($form_type, ['erp_demo', 'sponsoring', 'devis', 'newsletter', 'custom'])) {
    $form_type = 'devis';
}

$name = trim($data['name'] ?? $data['nom'] ?? '');
$company = trim($data['company'] ?? $data['entreprise'] ?? '');
$phone = trim($data['phone'] ?? $data['telephone'] ?? '');
$email = filter_var(trim($data['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$service_or_plan = trim($data['service_or_plan'] ?? $data['plan'] ?? $data['nature'] ?? '');
$budget = trim($data['budget'] ?? '');
$details = trim($data['details'] ?? $data['message'] ?? $data['description'] ?? '');

// Handle extra data (e.g. sectors, employees, fb_page)
$extra = [];
if (!empty($data['extra']) && is_array($data['extra'])) {
    $extra = $data['extra'];
} elseif (!empty($data['sectors'])) {
    $extra['sectors'] = $data['sectors'];
}
if (!empty($data['employees'])) {
    $extra['employees'] = $data['employees'];
}
if (!empty($data['page_link'])) {
    $extra['page_link'] = $data['page_link'];
}
if (!empty($data['timeline'])) {
    $extra['timeline'] = $data['timeline'];
}
$extra_json = !empty($extra) ? json_encode($extra, JSON_UNESCAPED_UNICODE) : '';

// Validation
if ($form_type === 'newsletter') {
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => 'Veuillez saisir une adresse email valide.']);
        exit;
    }
    if (empty($name)) {
        $name = 'Abonné Newsletter';
    }
} else {
    if (empty($name)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => 'Veuillez indiquer votre nom.']);
        exit;
    }
    if (empty($phone) && empty($email)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => 'Veuillez fournir au moins un moyen de contact (Téléphone ou Email).']);
        exit;
    }
}

// 3. Client IP & User Agent
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}
$ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

// 4. Save to Database
try {
    $pdo = get_db();
    $stmt = $pdo->prepare("
        INSERT INTO leads (
            form_type, name, company, phone, email, 
            service_or_plan, budget, details, extra_data, 
            ip_address, user_agent, status
        ) VALUES (
            :form_type, :name, :company, :phone, :email, 
            :service_or_plan, :budget, :details, :extra_data, 
            :ip_address, :user_agent, 'nouveau'
        )
    ");

    $stmt->execute([
        ':form_type' => $form_type,
        ':name' => $name,
        ':company' => $company,
        ':phone' => $phone,
        ':email' => $email,
        ':service_or_plan' => $service_or_plan,
        ':budget' => $budget,
        ':details' => $details,
        ':extra_data' => $extra_json,
        ':ip_address' => $ip,
        ':user_agent' => $ua,
    ]);

    $lead_id = (int)$pdo->lastInsertId();

    // 5. Optional Email Notification to Admin
    $notify_email = 'kherachiabdelhafid@gmail.com';
    $type_labels = [
        'erp_demo' => "🎁 Démo ERP (3 Mois Gratuits)",
        'sponsoring' => "🎯 Plan Publicitaire / Sponsoring",
        'devis' => "💻 Demande de Devis Général",
        'newsletter' => "📩 Inscription Newsletter",
    ];
    $type_label = $type_labels[$form_type] ?? "Nouveau Contact";

    $subject = "[$type_label] Nouveau lead #$lead_id : $name";
    $msg = "Nouvelle demande reçue sur ELITE SERVICE :\n\n";
    $msg .= "Type : $type_label\n";
    $msg .= "Nom : $name\n";
    if ($company) $msg .= "Entreprise : $company\n";
    if ($phone) $msg .= "Téléphone / WhatsApp : $phone\n";
    if ($email) $msg .= "Email : $email\n";
    if ($service_or_plan) $msg .= "Service / Offre : $service_or_plan\n";
    if ($budget) $msg .= "Budget : $budget\n";
    if ($details) $msg .= "Détails / Message :\n$details\n";
    $msg .= "\nConsultez tous vos leads sur l'admin : https://www.elitesce.com/admin/\n";

    $headers = "From: ELITE SERVICE <noreply@elitesce.com>\r\n" .
               "Reply-To: " . ($email ?: 'noreply@elitesce.com') . "\r\n" .
               "X-Mailer: PHP/" . phpversion();

    @mail($notify_email, $subject, $msg, $headers);

    echo json_encode([
        'success' => true,
        'lead_id' => $lead_id,
        'message' => 'Votre demande a été enregistrée avec succès. Notre équipe vous contactera dans les plus brefs délais !',
        'type' => $form_type,
    ]);

} catch (Exception $e) {
    error_log('Error saving lead: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Une erreur interne est survenue. Veuillez réessayer ou nous contacter sur WhatsApp.'
    ]);
}
