<?php
require_once __DIR__ . '/auth.php';

if (is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $error = 'Veuillez remplir tous les champs.';
    } else {
        $res = login($username, $password);
        if ($res['success']) {
            header('Location: index.php');
            exit;
        } else {
            $error = $res['error'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connexion Administration — ELITE SERVICE</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #08090d;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow-x: hidden;
    }
    
    /* Background Glow */
    .bg-glow {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(139,92,246,0.12) 40%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      filter: blur(80px);
      z-index: 0;
    }

    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      background: rgba(18, 20, 29, 0.85);
      border: 1px solid rgba(236, 72, 153, 0.28);
      border-radius: 1.5rem;
      padding: 2.5rem 2rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(236, 72, 153, 0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .brand-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
      text-decoration: none;
    }
    .brand-logo img {
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 0 12px rgba(236,72,153,0.5));
    }
    .brand-title {
      font-size: 1.6rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: #fff;
    }
    .brand-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .error-box {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 0.4rem;
      letter-spacing: 0.02em;
    }
    .form-input {
      width: 100%;
      background: rgba(10, 11, 16, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #ffffff;
      padding: 0.85rem 1rem;
      border-radius: 0.85rem;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.25s ease;
    }
    .form-input:focus {
      border-color: #ec4899;
      box-shadow: 0 0 16px rgba(236, 72, 153, 0.35);
      background: rgba(14, 16, 24, 0.95);
    }

    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #ec4899 0%, #c026d3 50%, #f97316 100%);
      color: #ffffff;
      border: none;
      padding: 0.95rem;
      border-radius: 0.85rem;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(236, 72, 153, 0.35);
      transition: all 0.25s ease;
      margin-top: 0.75rem;
    }
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(236, 72, 153, 0.5);
    }
    .submit-btn:active {
      transform: translateY(0);
    }

    .card-footer {
      text-align: center;
      margin-top: 1.75rem;
      font-size: 0.8rem;
      color: #64748b;
    }
    .card-footer a {
      color: #f472b6;
      text-decoration: none;
    }
    .card-footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="bg-glow"></div>

  <div class="login-card">
    <div class="brand-header">
      <div class="brand-logo">
        <img src="/assets/elite-logo.webp" alt="ELITE Logo">
        <span class="brand-title">ELITE</span>
      </div>
      <div class="brand-subtitle">Panneau d'Administration</div>
    </div>

    <?php if (!empty($error)): ?>
      <div class="error-box"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="POST" action="login.php">
      <div class="form-group">
        <label class="form-label" for="username">Identifiant</label>
        <input class="form-input" type="text" id="username" name="username" required autocomplete="username" placeholder="admin" autofocus>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Mot de passe</label>
        <input class="form-input" type="password" id="password" name="password" required autocomplete="current-password" placeholder="••••••••">
      </div>

      <button type="submit" class="submit-btn">Se connecter au tableau de bord →</button>
    </form>

    <div class="card-footer">
      <a href="/">← Retour au site public</a>
    </div>
  </div>
</body>
</html>
