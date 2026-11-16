<?php
/**
 * Elite Service - Database Connection & Initialization (SQLite PDO)
 */

function get_db() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $data_dir = __DIR__ . '/data';
    if (!is_dir($data_dir)) {
        @mkdir($data_dir, 0755, true);
    }

    $db_path = $data_dir . '/leads.db';
    $is_new = !file_exists($db_path);

    try {
        $pdo = new PDO('sqlite:' . $db_path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 15,
        ]);
        
        // Enable WAL mode for high concurrency
        $pdo->exec('PRAGMA journal_mode = WAL;');
        $pdo->exec('PRAGMA synchronous = NORMAL;');

        if ($is_new || !tables_exist($pdo)) {
            init_schema($pdo);
        }

        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection error: ' . $e->getMessage());
        throw new Exception('Database unavailable');
    }
}

function tables_exist($pdo) {
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='leads';");
    return (bool)$stmt->fetch();
}

function init_schema($pdo) {
    // 1. Leads Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_type TEXT NOT NULL,
            name TEXT NOT NULL,
            company TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            email TEXT DEFAULT '',
            service_or_plan TEXT DEFAULT '',
            budget TEXT DEFAULT '',
            details TEXT DEFAULT '',
            extra_data TEXT DEFAULT '',
            ip_address TEXT DEFAULT '',
            user_agent TEXT DEFAULT '',
            status TEXT DEFAULT 'nouveau',
            admin_notes TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_leads_form_type ON leads(form_type);
        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
        CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
    ");

    // 2. Admin Users Table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        );
    ");

    // 3. Login Attempts Table (Brute Force Protection)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT NOT NULL,
            attempt_time INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
    ");

    // Seed default admin if none exists
    $stmt = $pdo->query("SELECT COUNT(*) as cnt FROM admin_users;");
    $cnt = (int)$stmt->fetchColumn();
    if ($cnt === 0) {
        $default_user = 'admin';
        $default_pass = 'Elite2026@Admin!';
        $hash = password_hash($default_pass, PASSWORD_BCRYPT, ['cost' => 12]);
        $ins = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES (:u, :p);");
        $ins->execute([':u' => $default_user, ':p' => $hash]);
    }
}
