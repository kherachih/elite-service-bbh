<?php
require_once __DIR__ . '/auth.php';
require_login();

$pdo = get_db();

// Counts for KPI Cards
$stmt = $pdo->query("SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'nouveau' THEN 1 ELSE 0 END) as nouveaux,
    SUM(CASE WHEN form_type = 'erp_demo' THEN 1 ELSE 0 END) as erp,
    SUM(CASE WHEN form_type = 'sponsoring' THEN 1 ELSE 0 END) as sponsoring,
    SUM(CASE WHEN form_type = 'devis' THEN 1 ELSE 0 END) as devis,
    SUM(CASE WHEN form_type = 'newsletter' THEN 1 ELSE 0 END) as newsletter
FROM leads");
$counts = $stmt->fetch();

$total_leads = (int)($counts['total'] ?? 0);
$new_leads = (int)($counts['nouveaux'] ?? 0);
$erp_leads = (int)($counts['erp'] ?? 0);
$sponsoring_leads = (int)($counts['sponsoring'] ?? 0);
$devis_leads = (int)($counts['devis'] ?? 0);
$newsletter_leads = (int)($counts['newsletter'] ?? 0);

// Filters
$filter_type = $_GET['type'] ?? 'all';
$filter_status = $_GET['status'] ?? 'all';
$search = trim($_GET['q'] ?? '');

$sql = "SELECT * FROM leads WHERE 1=1";
$params = [];

if ($filter_type !== 'all' && !empty($filter_type)) {
    $sql .= " AND form_type = :type";
    $params[':type'] = $filter_type;
}
if ($filter_status !== 'all' && !empty($filter_status)) {
    $sql .= " AND status = :status";
    $params[':status'] = $filter_status;
}
if (!empty($search)) {
    $sql .= " AND (name LIKE :q OR company LIKE :q OR phone LIKE :q OR email LIKE :q OR service_or_plan LIKE :q OR details LIKE :q)";
    $params[':q'] = "%$search%";
}

$sql .= " ORDER BY id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$leads = $stmt->fetchAll();

// Helper to format Algerian phone numbers for WhatsApp
function format_whatsapp_url($phone, $name, $service, $form_type = '', $company = '') {
    if (empty($phone)) return '';
    $clean = preg_replace('/[^0-9]/', '', $phone);
    // If starts with 0 (e.g. 0555123456 or 0655123456 or 0770123456), replace leading 0 with 213
    if (strlen($clean) === 10 && $clean[0] === '0') {
        $clean = '213' . substr($clean, 1);
    } elseif (strlen($clean) === 9) {
        $clean = '213' . $clean;
    }
    if ($form_type === 'sponsoring') {
        $page_info = !empty($company) ? " pour votre page \"" . $company . "\"" : "";
        $text = "Bonjour " . ($name ?: '') . ",\n\nJe vous contacte suite à votre commande de Sponsoring sur ELITE SERVICE pour l'offre : " . ($service ?: 'Sponsoring') . $page_info . ".\n\nVotre page est-elle prête pour configurer les audiences et lancer la campagne ?";
    } elseif ($form_type === 'erp_demo') {
        $text = "Bonjour " . ($name ?: '') . ",\n\nJe vous contacte suite à votre demande d'accès gratuit de 3 mois à l'ERP ELITE Cloud.\n\nÊtes-vous disponible pour activer vos accès et planifier votre démonstration personnalisée ?";
    } else {
        $text = "Bonjour " . ($name ?: '') . ",\n\nJe vous contacte suite à votre demande sur ELITE SERVICE concernant : " . ($service ?: 'votre projet') . ".\n\nComment pouvons-nous vous accompagner ?";
    }
    return "https://wa.me/" . $clean . "?text=" . urlencode($text);
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tableau de Bord — ELITE SERVICE Administration</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg"/>
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico"/>
  <style>
    :root {
      --bg-body: #07080c;
      --bg-card: rgba(18, 20, 29, 0.75);
      --border-color: rgba(255, 255, 255, 0.08);
      --primary-magenta: #ec4899;
      --primary-violet: #8b5cf6;
      --accent-coral: #f97316;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-body);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    /* Ambient Background Glows */
    .glow-top-right {
      position: fixed;
      top: -150px;
      right: -100px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%);
      pointer-events: none;
      filter: blur(80px);
      z-index: 0;
    }
    .glow-bottom-left {
      position: fixed;
      bottom: -150px;
      left: -100px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%);
      pointer-events: none;
      filter: blur(80px);
      z-index: 0;
    }

    /* Top Navigation Header */
    .admin-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(11, 13, 20, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-color);
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .header-brand img {
      width: 32px;
      height: 32px;
      object-fit: contain;
      filter: drop-shadow(0 0 10px rgba(236,72,153,0.5));
    }
    .header-brand-text {
      font-size: 1.25rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #fff;
    }
    .header-badge {
      font-size: 0.7rem;
      background: rgba(236, 72, 153, 0.15);
      border: 1px solid rgba(236, 72, 153, 0.35);
      color: #f472b6;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.95rem;
      border-radius: 0.65rem;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    .btn-primary {
      background: linear-gradient(135deg, #ec4899 0%, #c026d3 50%, #f97316 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.35);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
    }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
    }

    /* Container */
    .admin-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1360px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      flex: 1;
    }

    /* Metric Cards Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1.15rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1.15rem;
      padding: 1.35rem 1.25rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, var(--card-color, #ec4899), transparent);
    }
    .stat-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .stat-value {
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #ffffff;
      line-height: 1;
      margin-bottom: 0.35rem;
    }
    .stat-sub {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    /* Controls Bar: Filters & Search */
    .controls-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1.15rem;
      padding: 1.2rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .search-box {
      flex: 1;
      min-width: 250px;
      position: relative;
    }
    .search-input {
      width: 100%;
      background: rgba(10, 11, 16, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      padding: 0.65rem 1rem 0.65rem 2.4rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.2s ease;
    }
    .search-input:focus {
      border-color: var(--primary-magenta);
      box-shadow: 0 0 12px rgba(236,72,153,0.3);
    }
    .search-icon {
      position: absolute;
      left: 0.8rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
      pointer-events: none;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .select-filter {
      background: rgba(10, 11, 16, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      padding: 0.65rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.85rem;
      outline: none;
      cursor: pointer;
    }
    .select-filter:focus {
      border-color: var(--primary-magenta);
    }

    /* Status Filter Tabs */
    .status-tabs {
      display: flex;
      gap: 0.35rem;
      overflow-x: auto;
      margin-bottom: 1.25rem;
      padding-bottom: 0.25rem;
    }
    .tab-item {
      padding: 0.45rem 0.95rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    .tab-item.active {
      background: rgba(236, 72, 153, 0.16);
      border-color: rgba(236, 72, 153, 0.45);
      color: #f472b6;
    }

    /* Leads Table */
    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }
    th {
      background: rgba(14, 16, 24, 0.95);
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 1rem 1.15rem;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }
    td {
      padding: 1.15rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
      vertical-align: middle;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35em;
      padding: 0.25em 0.7em;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-erp {
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.35);
    }
    .badge-sponsoring {
      background: rgba(249, 115, 22, 0.15);
      color: #fb923c;
      border: 1px solid rgba(249, 115, 22, 0.35);
    }
    .badge-devis {
      background: rgba(6, 182, 212, 0.15);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.35);
    }
    .badge-newsletter {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }

    /* Status Select Pill */
    .status-select {
      background: rgba(10, 11, 16, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 0.78rem;
      padding: 0.35rem 0.65rem;
      border-radius: 0.55rem;
      cursor: pointer;
      font-weight: 600;
      outline: none;
      transition: all 0.2s;
    }
    .status-select[data-val="nouveau"] {
      border-color: #ec4899;
      color: #f472b6;
    }
    .status-select[data-val="contacte"] {
      border-color: #3b82f6;
      color: #60a5fa;
    }
    .status-select[data-val="en_cours"] {
      border-color: #f59e0b;
      color: #fbbf24;
    }
    .status-select[data-val="conclu"] {
      border-color: #10b981;
      color: #34d399;
    }
    .status-select[data-val="archive"] {
      border-color: #64748b;
      color: #94a3b8;
    }

    /* Action Buttons in Row */
    .actions-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }
    .action-btn {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      transform: translateY(-1px);
    }
    .action-btn.whatsapp {
      background: rgba(37, 211, 102, 0.15);
      border-color: rgba(37, 211, 102, 0.4);
      color: #25d366;
    }
    .action-btn.whatsapp:hover {
      background: #25d366;
      color: #fff;
      box-shadow: 0 0 14px rgba(37, 211, 102, 0.5);
    }
    .action-btn.delete:hover {
      background: #ef4444;
      border-color: #ef4444;
      color: #fff;
    }

    /* Modal Backdrop & Box */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 1000;
    }
    .modal-backdrop.active {
      display: flex;
    }
    .modal-box {
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      background: #0f111a;
      border: 1px solid rgba(236, 72, 153, 0.35);
      border-radius: 1.35rem;
      padding: 2rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(236, 72, 153, 0.15);
      position: relative;
    }
    .modal-close {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .modal-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 1.5rem;
      color: #64748b;
    }
    .empty-state svg {
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      padding: 0.85rem 1.35rem;
      border-radius: 0.75rem;
      box-shadow: 0 15px 30px rgba(0,0,0,0.5);
      z-index: 2000;
      display: none;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .toast.active { display: flex; animation: slideUp 0.3s ease; }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 768px) {
      .admin-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
      .controls-card {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-group {
        justify-content: space-between;
      }
    }
  </style>
</head>
<body>
  <div class="glow-top-right"></div>
  <div class="glow-bottom-left"></div>

  <!-- Header -->
  <header class="admin-header">
    <a href="index.php" class="header-brand">
      <img src="/assets/elite-logo.webp" alt="ELITE Logo">
      <span class="header-brand-text">ELITE</span>
      <span class="header-badge">Admin Leads</span>
    </a>

    <div class="header-actions">
      <a href="export.php?type=<?php echo urlencode($filter_type); ?>&status=<?php echo urlencode($filter_status); ?>" class="btn btn-secondary" title="Télécharger la liste au format Excel / CSV">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Exporter CSV</span>
      </a>

      <button type="button" onclick="openPasswordModal();" class="btn btn-secondary" title="Modifier le mot de passe admin">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span>Sécurité</span>
      </button>

      <a href="/" target="_blank" class="btn btn-secondary" title="Ouvrir le site public">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        <span>Site Public</span>
      </a>

      <a href="logout.php" class="btn btn-danger" title="Se déconnecter">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        <span>Quitter</span>
      </a>
    </div>
  </header>

  <main class="admin-container">

    <!-- KPI Stats -->
    <div class="stats-grid">
      <div class="stat-card" style="--card-color:#ec4899;">
        <div class="stat-label">
          <span>📬 Total Demandes</span>
        </div>
        <div class="stat-value"><?php echo $total_leads; ?></div>
        <div class="stat-sub">Tous les formulaires confondus</div>
      </div>

      <div class="stat-card" style="--card-color:#3b82f6;">
        <div class="stat-label">
          <span>🔥 Nouveaux à Traiter</span>
        </div>
        <div class="stat-value" style="color:#f472b6;"><?php echo $new_leads; ?></div>
        <div class="stat-sub">En attente de premier contact</div>
      </div>

      <div class="stat-card" style="--card-color:#f97316;">
        <div class="stat-label">
          <span>🎁 Démo ERP (3 Mois)</span>
        </div>
        <div class="stat-value" style="color:#fb923c;"><?php echo $erp_leads; ?></div>
        <div class="stat-sub">Candidats à l'offre exclusive ERP</div>
      </div>

      <div class="stat-card" style="--card-color:#06b6d4;">
        <div class="stat-label">
          <span>🎯 Sponsoring & Devis</span>
        </div>
        <div class="stat-value" style="color:#22d3ee;"><?php echo ($sponsoring_leads + $devis_leads); ?></div>
        <div class="stat-sub"><?php echo $sponsoring_leads; ?> Sponsoring • <?php echo $devis_leads; ?> Devis</div>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="status-tabs">
      <a href="index.php?type=<?php echo urlencode($filter_type); ?>&status=all&q=<?php echo urlencode($search); ?>" class="tab-item <?php echo $filter_status === 'all' ? 'active' : ''; ?>">
        Tous (<?php echo $total_leads; ?>)
      </a>
      <a href="index.php?type=<?php echo urlencode($filter_type); ?>&status=nouveau&q=<?php echo urlencode($search); ?>" class="tab-item <?php echo $filter_status === 'nouveau' ? 'active' : ''; ?>">
        Nouveaux (<?php echo $new_leads; ?>)
      </a>
      <a href="index.php?type=<?php echo urlencode($filter_type); ?>&status=contacte&q=<?php echo urlencode($search); ?>" class="tab-item <?php echo $filter_status === 'contacte' ? 'active' : ''; ?>">
        Contactés
      </a>
      <a href="index.php?type=<?php echo urlencode($filter_type); ?>&status=en_cours&q=<?php echo urlencode($search); ?>" class="tab-item <?php echo $filter_status === 'en_cours' ? 'active' : ''; ?>">
        En cours
      </a>
      <a href="index.php?type=<?php echo urlencode($filter_type); ?>&status=conclu&q=<?php echo urlencode($search); ?>" class="tab-item <?php echo $filter_status === 'conclu' ? 'active' : ''; ?>">
        Conclus
      </a>
      <a href="index.php?type=<?php echo urlencode($filter_type); ?>&status=archive&q=<?php echo urlencode($search); ?>" class="tab-item <?php echo $filter_status === 'archive' ? 'active' : ''; ?>">
        Archivés
      </a>
    </div>

    <!-- Filters & Search Bar -->
    <form method="GET" action="index.php" class="controls-card">
      <input type="hidden" name="status" value="<?php echo htmlspecialchars($filter_status); ?>">
      
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" name="q" value="<?php echo htmlspecialchars($search); ?>" class="search-input" placeholder="Rechercher par nom, entreprise, téléphone, mot-clé...">
      </div>

      <div class="filter-group">
        <select name="type" class="select-filter" onchange="this.form.submit()">
          <option value="all" <?php echo $filter_type === 'all' ? 'selected' : ''; ?>>Tous les types de formulaires</option>
          <option value="erp_demo" <?php echo $filter_type === 'erp_demo' ? 'selected' : ''; ?>>🎁 Démo ERP (3 Mois Gratuits)</option>
          <option value="sponsoring" <?php echo $filter_type === 'sponsoring' ? 'selected' : ''; ?>>🎯 Sponsoring / Publicité</option>
          <option value="devis" <?php echo $filter_type === 'devis' ? 'selected' : ''; ?>>💻 Demande de Devis Général</option>
          <option value="newsletter" <?php echo $filter_type === 'newsletter' ? 'selected' : ''; ?>>📩 Inscriptions Newsletter</option>
        </select>

        <button type="submit" class="btn btn-secondary">Filtrer</button>
        <?php if (!empty($search) || $filter_type !== 'all' || $filter_status !== 'all'): ?>
          <a href="index.php" class="btn btn-secondary">Réinitialiser</a>
        <?php endif; ?>
      </div>
    </form>

    <!-- Leads Table -->
    <div class="table-card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Formulaire</th>
              <th>Client / Entreprise</th>
              <th>Contact</th>
              <th>Service / Plan</th>
              <th>Statut</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($leads)): ?>
              <tr>
                <td colspan="7">
                  <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <p>Aucune demande trouvée pour les critères sélectionnés.</p>
                  </div>
                </td>
              </tr>
            <?php else: ?>
              <?php foreach ($leads as $lead): 
                $date_str = date('d/m/Y H:i', strtotime($lead['created_at']));
                $wa_url = format_whatsapp_url($lead['phone'], $lead['name'], $lead['service_or_plan'], $lead['form_type'], $lead['company']);
              ?>
                <tr id="lead-row-<?php echo $lead['id']; ?>">
                  <td style="font-size:0.8rem; color:#94a3b8; white-space:nowrap;">
                    <?php echo $date_str; ?>
                  </td>

                  <td>
                    <?php if ($lead['form_type'] === 'erp_demo'): ?>
                      <span class="badge badge-erp">🎁 Démo ERP</span>
                    <?php elseif ($lead['form_type'] === 'sponsoring'): ?>
                      <span class="badge badge-sponsoring">🎯 Sponsoring</span>
                    <?php elseif ($lead['form_type'] === 'devis'): ?>
                      <span class="badge badge-devis">💻 Devis</span>
                    <?php elseif ($lead['form_type'] === 'newsletter'): ?>
                      <span class="badge badge-newsletter">📩 Newsletter</span>
                    <?php else: ?>
                      <span class="badge badge-devis"><?php echo htmlspecialchars($lead['form_type']); ?></span>
                    <?php endif; ?>
                  </td>

                  <td>
                    <div style="font-weight:700; color:#fff; font-size:0.95rem;">
                      <?php echo htmlspecialchars($lead['name']); ?>
                    </div>
                    <?php if (!empty($lead['company'])): ?>
                      <?php if ($lead['form_type'] === 'sponsoring'): ?>
                        <div style="font-size:0.82rem; color:#f472b6; font-weight:700; margin-top:2px;">
                          📱 Page : <?php echo htmlspecialchars($lead['company']); ?>
                        </div>
                      <?php else: ?>
                        <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">
                          🏢 <?php echo htmlspecialchars($lead['company']); ?>
                        </div>
                      <?php endif; ?>
                    <?php endif; ?>
                  </td>

                  <td>
                    <?php if (!empty($lead['phone'])): ?>
                      <div style="margin-bottom:2px;">
                        <a href="tel:<?php echo htmlspecialchars($lead['phone']); ?>" style="color:#f472b6; text-decoration:none; font-weight:600; font-size:0.85rem;">
                          📞 <?php echo htmlspecialchars($lead['phone']); ?>
                        </a>
                      </div>
                    <?php endif; ?>
                    <?php if (!empty($lead['email'])): ?>
                      <div>
                        <a href="mailto:<?php echo htmlspecialchars($lead['email']); ?>" style="color:#94a3b8; text-decoration:none; font-size:0.8rem;">
                          ✉️ <?php echo htmlspecialchars($lead['email']); ?>
                        </a>
                      </div>
                    <?php endif; ?>
                  </td>

                  <td>
                    <div style="font-weight:600; color:#e2e8f0; font-size:0.85rem;">
                      <?php echo htmlspecialchars($lead['service_or_plan'] ?: 'Non spécifié'); ?>
                    </div>
                    <?php if (!empty($lead['budget'])): ?>
                      <div style="font-size:0.78rem; color:#fbbf24;">
                        💰 <?php echo htmlspecialchars($lead['budget']); ?>
                      </div>
                    <?php endif; ?>
                  </td>

                  <td>
                    <select class="status-select" data-val="<?php echo htmlspecialchars($lead['status']); ?>" onchange="updateLeadStatus(<?php echo $lead['id']; ?>, this.value, this);">
                      <option value="nouveau" <?php echo $lead['status'] === 'nouveau' ? 'selected' : ''; ?>>Nouveau</option>
                      <option value="contacte" <?php echo $lead['status'] === 'contacte' ? 'selected' : ''; ?>>Contacté</option>
                      <option value="en_cours" <?php echo $lead['status'] === 'en_cours' ? 'selected' : ''; ?>>En cours</option>
                      <option value="conclu" <?php echo $lead['status'] === 'conclu' ? 'selected' : ''; ?>>Conclu</option>
                      <option value="archive" <?php echo $lead['status'] === 'archive' ? 'selected' : ''; ?>>Archivé</option>
                    </select>
                  </td>

                  <td style="text-align:right;">
                    <div class="actions-cell" style="justify-content:flex-end;">
                      <?php if (!empty($wa_url)): ?>
                        <a href="<?php echo $wa_url; ?>" target="_blank" class="action-btn whatsapp" title="Ouvrir WhatsApp avec message personnalisé">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </a>
                      <?php endif; ?>

                      <button type="button" class="action-btn" onclick="openLeadModal(<?php echo $lead['id']; ?>);" title="Voir les détails complets et notes">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>

                      <button type="button" class="action-btn delete" onclick="deleteLead(<?php echo $lead['id']; ?>);" title="Supprimer ce lead">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- Lead Detail Modal -->
  <div id="lead-modal" class="modal-backdrop">
    <div class="modal-box">
      <button type="button" class="modal-close" onclick="closeLeadModal();">&times;</button>
      <div id="modal-content">
        <p style="color:#94a3b8;">Chargement des données...</p>
      </div>
    </div>
  </div>

  <!-- Password Change Modal -->
  <div id="password-modal" class="modal-backdrop">
    <div class="modal-box" style="max-width:440px;">
      <button type="button" class="modal-close" onclick="closePasswordModal();">&times;</button>
      <h3 style="margin-bottom:1.25rem; font-size:1.3rem; color:#fff;">Modifier le mot de passe</h3>
      
      <form onsubmit="handlePasswordChange(event);">
        <div style="margin-bottom:1rem;">
          <label style="display:block; font-size:0.8rem; color:#94a3b8; margin-bottom:0.35rem;">Mot de passe actuel</label>
          <input type="password" id="current_password" required class="search-input" style="padding-left:1rem;">
        </div>
        <div style="margin-bottom:1.5rem;">
          <label style="display:block; font-size:0.8rem; color:#94a3b8; margin-bottom:0.35rem;">Nouveau mot de passe (min. 6 caractères)</label>
          <input type="password" id="new_password" required minlength="6" class="search-input" style="padding-left:1rem;">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding:0.75rem;">Enregistrer le nouveau mot de passe</button>
      </form>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="toast">
    <span id="toast-icon">✓</span>
    <span id="toast-msg">Opération effectuée</span>
  </div>

  <script>
    function showToast(msg, isSuccess = true) {
      const toast = document.getElementById('toast');
      const toastMsg = document.getElementById('toast-msg');
      const toastIcon = document.getElementById('toast-icon');
      toastMsg.textContent = msg;
      toastIcon.textContent = isSuccess ? '✓' : '⚠️';
      toast.style.borderColor = isSuccess ? 'rgba(37,211,102,0.4)' : 'rgba(239,68,68,0.4)';
      toast.classList.add('active');
      setTimeout(() => toast.classList.remove('active'), 3000);
    }

    function updateLeadStatus(id, newStatus, selectElem) {
      fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', id: id, status: newStatus })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (selectElem) selectElem.setAttribute('data-val', newStatus);
          showToast('Statut mis à jour : ' + newStatus);
        } else {
          showToast(data.error || 'Erreur lors de la mise à jour', false);
        }
      })
      .catch(err => showToast('Erreur réseau', false));
    }

    function deleteLead(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette demande ?')) return;

      fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_lead', id: id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const row = document.getElementById('lead-row-' + id);
          if (row) row.remove();
          showToast('Demande supprimée avec succès');
        } else {
          showToast(data.error || 'Erreur lors de la suppression', false);
        }
      })
      .catch(err => showToast('Erreur réseau', false));
    }

    function openLeadModal(id) {
      const modal = document.getElementById('lead-modal');
      const content = document.getElementById('modal-content');
      modal.classList.add('active');
      content.innerHTML = '<p style="color:#94a3b8;">Chargement des données du lead #' + id + '...</p>';

      fetch('api.php?action=get_lead&id=' + id)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          content.innerHTML = '<p style="color:#fca5a5;">' + (data.error || 'Erreur') + '</p>';
          return;
        }
        const l = data.lead;
        let extraHtml = '';
        if (l.extra_data) {
          try {
            const ex = JSON.parse(l.extra_data);
            extraHtml = '<div style="margin-top:1rem; padding:1rem; background:rgba(255,255,255,0.03); border-radius:0.75rem; border:1px solid rgba(255,255,255,0.06);">';
            extraHtml += '<h4 style="font-size:0.8rem; color:#94a3b8; text-transform:uppercase; margin-bottom:0.5rem;">Informations complémentaires</h4>';
            for (let [k, v] of Object.entries(ex)) {
              extraHtml += '<div style="font-size:0.85rem; margin-bottom:0.25rem;"><strong style="color:#e2e8f0;">' + k + ' :</strong> <span style="color:#cbd5e1;">' + (Array.isArray(v) ? v.join(', ') : v) + '</span></div>';
            }
            extraHtml += '</div>';
          } catch(e) {}
        }

        content.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div>
              <h3 style="font-size:1.4rem; color:#fff; font-weight:800;">${l.name}</h3>
              <div style="font-size:0.85rem; color:#94a3b8;">${l.company ? (l.form_type === 'sponsoring' ? '<span style=\"color:#f472b6; font-weight:700;\">📱 Page : ' + l.company + '</span> • ' : '🏢 ' + l.company + ' • ') : ''}Reçu le ${l.created_at}</div>
            </div>
            <span class="badge badge-erp">${l.form_type}</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.25rem;">
            <div style="background:rgba(255,255,255,0.02); padding:0.85rem; border-radius:0.75rem; border:1px solid rgba(255,255,255,0.05);">
              <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Téléphone / WhatsApp</span>
              <div style="font-weight:700; color:#f472b6; font-size:1rem; margin-top:0.2rem;">
                ${l.phone ? '<a href="tel:' + l.phone + '" style="color:inherit; text-decoration:none;">' + l.phone + '</a>' : '<span style="color:#64748b;">Non renseigné</span>'}
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.02); padding:0.85rem; border-radius:0.75rem; border:1px solid rgba(255,255,255,0.05);">
              <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Email</span>
              <div style="font-weight:600; color:#cbd5e1; font-size:0.95rem; margin-top:0.2rem; word-break:break-all;">
                ${l.email ? '<a href="mailto:' + l.email + '" style="color:inherit; text-decoration:none;">' + l.email + '</a>' : '<span style="color:#64748b;">Non renseigné</span>'}
              </div>
            </div>
          </div>

          <div style="margin-bottom:1.25rem;">
            <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Service ou Plan souhaité</span>
            <div style="font-size:1.05rem; font-weight:700; color:#fff; margin-top:0.25rem;">
              ${l.service_or_plan || 'Non spécifié'} ${l.budget ? '<span style="color:#fbbf24; font-size:0.9rem;">(' + l.budget + ')</span>' : ''}
            </div>
          </div>

          ${l.details ? `
            <div style="margin-bottom:1.25rem;">
              <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase;">Détails & Message du client</span>
              <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:0.75rem; border:1px solid rgba(255,255,255,0.08); font-size:0.9rem; line-height:1.6; color:#e2e8f0; margin-top:0.35rem; white-space:pre-wrap;">${l.details}</div>
            </div>
          ` : ''}

          ${extraHtml}

          <!-- Admin Notes -->
          <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,0.08);">
            <label style="display:block; font-size:0.8rem; color:#f472b6; font-weight:700; text-transform:uppercase; margin-bottom:0.4rem;">
              📝 Notes Administrateur Privées
            </label>
            <textarea id="modal-admin-notes" class="search-input" rows="3" style="padding-left:1rem; width:100%; resize:vertical;" placeholder="Ex: Client rappelé le 17/11, intéressé par formule annuelle, devis envoyé...">${l.admin_notes || ''}</textarea>
            <div style="margin-top:0.6rem; text-align:right;">
              <button type="button" class="btn btn-primary" onclick="saveLeadNotes(${l.id});">Enregistrer les notes</button>
            </div>
          </div>
        `;
      });
    }

    function saveLeadNotes(id) {
      const notes = document.getElementById('modal-admin-notes').value.trim();
      fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_notes', id: id, notes: notes })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Notes enregistrées avec succès !');
        } else {
          showToast(data.error || 'Erreur', false);
        }
      });
    }

    function closeLeadModal() {
      document.getElementById('lead-modal').classList.remove('active');
    }

    function openPasswordModal() {
      document.getElementById('password-modal').classList.add('active');
    }
    function closePasswordModal() {
      document.getElementById('password-modal').classList.remove('active');
    }

    function handlePasswordChange(e) {
      e.preventDefault();
      const current = document.getElementById('current_password').value;
      const next = document.getElementById('new_password').value;

      fetch('api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', current_password: current, new_password: next })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Mot de passe changé avec succès !');
          closePasswordModal();
          e.target.reset();
        } else {
          showToast(data.error || 'Erreur lors du changement', false);
        }
      });
    }

    // Close modals on escape key or backdrop click
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeLeadModal();
        closePasswordModal();
      }
    });
    document.querySelectorAll('.modal-backdrop').forEach(b => {
      b.addEventListener('click', e => {
        if (e.target === b) {
          closeLeadModal();
          closePasswordModal();
        }
      });
    });
  </script>
</body>
</html>
