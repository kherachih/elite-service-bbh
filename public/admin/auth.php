<?php
/**
 * Elite Service Admin - Authentication & Security Helpers
 */

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Strict');
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        ini_set('session.cookie_secure', '1');
    }
    session_start();
}

require_once __DIR__ . '/../api/db.php';

function is_logged_in() {
    return !empty($_SESSION['elite_admin_logged']) && !empty($_SESSION['elite_admin_user']);
}

function require_login() {
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function check_brute_force($pdo, $ip) {
    $cutoff = time() - (15 * 60); // 15 minutes window
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip_address = :ip AND attempt_time > :cutoff");
    $stmt->execute([':ip' => $ip, ':cutoff' => $cutoff]);
    $attempts = (int)$stmt->fetchColumn();
    return $attempts >= 5; // Lock out after 5 attempts
}

function record_login_attempt($pdo, $ip) {
    $stmt = $pdo->prepare("INSERT INTO login_attempts (ip_address, attempt_time) VALUES (:ip, :t)");
    $stmt->execute([':ip' => $ip, ':t' => time()]);
}

function clear_login_attempts($pdo, $ip) {
    $stmt = $pdo->prepare("DELETE FROM login_attempts WHERE ip_address = :ip");
    $stmt->execute([':ip' => $ip]);
}

function login($username, $password) {
    $pdo = get_db();
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    if (check_brute_force($pdo, $ip)) {
        return ['success' => false, 'error' => 'Trop de tentatives échouées. Veuillez patienter 15 minutes.'];
    }

    $stmt = $pdo->prepare("SELECT id, username, password_hash FROM admin_users WHERE username = :u LIMIT 1");
    $stmt->execute([':u' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        clear_login_attempts($pdo, $ip);

        // Regenerate session ID for security
        session_regenerate_id(true);
        $_SESSION['elite_admin_logged'] = true;
        $_SESSION['elite_admin_id'] = $user['id'];
        $_SESSION['elite_admin_user'] = $user['username'];

        // Update last login
        $upd = $pdo->prepare("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = :id");
        $upd->execute([':id' => $user['id']]);

        return ['success' => true];
    } else {
        record_login_attempt($pdo, $ip);
        return ['success' => false, 'error' => 'Identifiant ou mot de passe incorrect.'];
    }
}

function logout() {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
}
