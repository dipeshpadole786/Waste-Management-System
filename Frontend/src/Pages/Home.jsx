import { useState, useEffect } from "react";
import WasteBotWidget from "../Componets/WasteBotWidget";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');

  :root {
    --saffron: #E07B2A;
    --saffron-light: #F5A623;
    --saffron-pale: #FEF3E7;
    --navy: #0A1628;
    --navy-mid: #152238;
    --navy-light: #1E3556;
    --navy-pale: #EEF2F8;
    --green: #1A6B3A;
    --green-light: #228B4A;
    --green-pale: #EAF5EE;
    --red: #C0392B;
    --red-pale: #FDECEB;
    --gold: #C9A84C;
    --text-primary: #0A1628;
    --text-secondary: #4A5568;
    --text-muted: #718096;
    --border: #D4DCE8;
    --border-light: #EEF2F8;
    --surface: #FFFFFF;
    --bg: #F4F6FA;
    --shadow-sm: 0 1px 3px rgba(10,22,40,0.08), 0 1px 2px rgba(10,22,40,0.04);
    --shadow-md: 0 4px 16px rgba(10,22,40,0.10), 0 2px 6px rgba(10,22,40,0.06);
    --shadow-lg: 0 12px 40px rgba(10,22,40,0.14), 0 4px 12px rgba(10,22,40,0.08);
    --radius: 10px;
    --radius-lg: 16px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .portal-body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text-primary);
    min-height: 100vh;
  }

  .portal-body a { text-decoration: none; color: inherit; }

  /* ─── ALERT TICKER ─── */
  .alert-ticker {
    background: var(--navy);
    color: #CBD5E0;
    padding: 9px 0;
    border-bottom: 2px solid var(--saffron);
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.3px;
  }
  .alert-ticker-inner {
    display: flex;
    align-items: center;
    gap: 0;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .ticker-label {
    background: var(--saffron);
    color: #fff;
    padding: 3px 14px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
    margin-right: 20px;
  }
  .ticker-scroll {
    overflow: hidden;
    flex: 1;
  }
  .ticker-text {
    white-space: nowrap;
    animation: ticker 30s linear infinite;
    display: inline-block;
  }
  @keyframes ticker {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
  .ticker-sep { margin: 0 24px; color: var(--saffron); font-weight: 700; }

  /* ─── MAIN WRAPPER ─── */
  .portal-main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 24px 48px;
  }

  /* ─── EMERGENCY HERO BANNER ─── */
  .emergency-hero {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 60%, #1A3A6B 100%);
    border-radius: var(--radius-lg);
    padding: 36px 40px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    box-shadow: var(--shadow-lg);
  }
  .emergency-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(224,123,42,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .emergency-hero::after {
    content: '';
    position: absolute;
    bottom: -80px; left: 40%;
    width: 400px; height: 200px;
    background: radial-gradient(ellipse, rgba(26,107,58,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-content { position: relative; z-index: 1; flex: 1; }
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(224,123,42,0.18);
    border: 1px solid rgba(224,123,42,0.35);
    color: var(--saffron-light);
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .hero-eyebrow-dot {
    width: 6px; height: 6px;
    background: var(--saffron-light);
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }
  .hero-title {
    font-family: 'EB Garamond', serif;
    font-size: 36px;
    font-weight: 600;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 10px;
    letter-spacing: -0.3px;
  }
  .hero-title span { color: var(--saffron-light); }
  .hero-subtitle {
    color: rgba(255,255,255,0.65);
    font-size: 15px;
    font-weight: 400;
    max-width: 420px;
    line-height: 1.6;
  }
  .hero-actions {
    display: flex;
    gap: 14px;
    margin-top: 28px;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
  }
  .btn-hero-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--saffron);
    color: #fff;
    padding: 13px 28px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.22s ease;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 16px rgba(224,123,42,0.35);
  }
  .btn-hero-primary:hover {
    background: #C96D20;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(224,123,42,0.45);
  }
  .btn-hero-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.9);
    padding: 13px 28px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    border: 1px solid rgba(255,255,255,0.2);
    cursor: pointer;
    transition: all 0.22s ease;
    letter-spacing: 0.3px;
  }
  .btn-hero-secondary:hover {
    background: rgba(255,255,255,0.15);
    transform: translateY(-2px);
  }
  .hero-stats {
    display: flex;
    gap: 0;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .hero-stat {
    padding: 22px 28px;
    text-align: center;
    border-right: 1px solid rgba(255,255,255,0.1);
  }
  .hero-stat:last-child { border-right: none; }
  .hero-stat-value {
    font-family: 'EB Garamond', serif;
    font-size: 30px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 4px;
  }
  .hero-stat-label {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ─── SECTION LABEL ─── */
  .section-label {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .section-label-line {
    width: 4px;
    height: 22px;
    background: linear-gradient(180deg, var(--saffron) 0%, var(--green) 100%);
    border-radius: 2px;
    flex-shrink: 0;
  }
  .section-label h2 {
    font-family: 'EB Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: var(--navy);
    letter-spacing: -0.2px;
  }
  .section-label-tag {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-muted);
    background: var(--border-light);
    padding: 4px 12px;
    border-radius: 20px;
  }

  /* ─── SERVICES GRID ─── */
  .services-section { margin-bottom: 36px; }
  .services-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px) { .services-grid { grid-template-columns: 1fr; } }

  .service-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .service-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: var(--card-accent, var(--navy));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  .service-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: transparent; }
  .service-card:hover::after { transform: scaleX(1); }

  .service-card.emergency { --card-accent: var(--red); }
  .service-card.complaint { --card-accent: var(--saffron); }
  .service-card.track { --card-accent: var(--navy); }
  .service-card.safety { --card-accent: var(--green); }

  .sc-icon-wrap {
    width: 48px; height: 48px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin-bottom: 16px;
    transition: transform 0.25s ease;
  }
  .service-card:hover .sc-icon-wrap { transform: scale(1.1) rotate(-3deg); }
  .sc-icon-wrap.emergency { background: var(--red-pale); }
  .sc-icon-wrap.complaint { background: var(--saffron-pale); }
  .sc-icon-wrap.track { background: var(--navy-pale); }
  .sc-icon-wrap.safety { background: var(--green-pale); }

  .sc-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 5px;
    line-height: 1.3;
  }
  .sc-desc {
    font-size: 12.5px;
    color: var(--text-muted);
    margin-bottom: 20px;
    line-height: 1.5;
    flex: 1;
  }
  .sc-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.3px;
  }
  .sc-btn.emergency { background: var(--red-pale); color: var(--red); }
  .sc-btn.emergency:hover { background: var(--red); color: #fff; }
  .sc-btn.complaint { background: var(--saffron-pale); color: var(--saffron); }
  .sc-btn.complaint:hover { background: var(--saffron); color: #fff; }
  .sc-btn.track { background: var(--navy-pale); color: var(--navy); }
  .sc-btn.track:hover { background: var(--navy); color: #fff; }
  .sc-btn.safety { background: var(--green-pale); color: var(--green); }
  .sc-btn.safety:hover { background: var(--green); color: #fff; }

  /* ─── CONTENT GRID ─── */
  .content-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 24px;
    margin-bottom: 32px;
  }
  @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }

  /* ─── CAMERA CARD ─── */
  .camera-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }
  .card-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--navy);
    border-bottom: 2px solid var(--saffron);
  }
  .card-top-bar-title {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  .card-top-bar-icon {
    width: 32px; height: 32px;
    background: rgba(255,255,255,0.1);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .official-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.85);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .tricolor-bar {
    display: flex;
    width: 18px;
    height: 12px;
    border-radius: 2px;
    overflow: hidden;
  }
  .tricolor-bar span { flex: 1; }
  .tricolor-bar .tc-s { background: #FF9933; }
  .tricolor-bar .tc-w { background: #fff; }
  .tricolor-bar .tc-g { background: #138808; }

  .card-body-pad { padding: 24px; }

  /* Emergency mode */
  .emergency-mode-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #FDECEB, #FEF0EE);
    border: 1px solid rgba(192,57,43,0.25);
    border-left: 4px solid var(--red);
    border-radius: 7px;
    padding: 12px 16px;
    margin-bottom: 20px;
  }
  .emb-dot {
    width: 8px; height: 8px;
    background: var(--red);
    border-radius: 50%;
    animation: pulse-dot 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }
  .emb-text { font-size: 13px; font-weight: 600; color: var(--red); }
  .emb-sub { font-size: 12px; color: #E74C3C; font-weight: 400; margin-top: 1px; }

  /* Camera prompt */
  .camera-prompt-box {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 36px 24px;
    text-align: center;
    background: var(--bg);
    transition: all 0.25s ease;
  }
  .camera-prompt-box:hover { border-color: var(--navy-light); background: var(--navy-pale); }
  .cp-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.7; }
  .cp-title { font-size: 16px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
  .cp-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 280px; margin: 0 auto 20px; }
  .cp-hint {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--saffron-pale);
    color: var(--saffron);
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 500;
  }

  .camera-controls-row {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  .btn-ctrl {
    flex: 1;
    min-width: 120px;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn-ctrl.outline {
    background: transparent;
    color: var(--navy);
    border: 1.5px solid var(--border);
  }
  .btn-ctrl.outline:hover { background: var(--navy-pale); border-color: var(--navy); }
  .btn-ctrl.muted {
    background: var(--green-pale);
    color: var(--green);
    border: 1.5px solid transparent;
  }
  .btn-ctrl.muted:hover { background: var(--green); color: #fff; }

  .card-foot {
    padding: 14px 20px;
    border-top: 1px solid var(--border-light);
    background: var(--bg);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--green);
    font-weight: 500;
  }

  /* Contacts card */
  .contacts-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    margin-top: 20px;
  }
  .contacts-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-light);
    background: var(--navy-pale);
  }
  .contacts-card-header h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--navy);
  }
  .contacts-list { padding: 0; }
  .contact-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 18px;
    border-bottom: 1px solid var(--border-light);
    transition: background 0.2s;
  }
  .contact-row:last-child { border-bottom: none; }
  .contact-row:hover { background: var(--bg); }
  .contact-info { display: flex; align-items: center; gap: 10px; }
  .contact-dot {
    width: 8px; height: 8px;
    background: var(--green);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .contact-name { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
  .contact-num {
    font-family: 'EB Garamond', serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--navy);
    background: var(--navy-pale);
    padding: 3px 12px;
    border-radius: 5px;
    letter-spacing: 0.5px;
  }

  /* ─── RIGHT COLUMN ─── */
  .right-col { display: flex; flex-direction: column; gap: 20px; }

  /* Notification card */
  .notif-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    flex: 1;
  }
  .notif-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light);
    background: var(--surface);
  }
  .notif-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .notif-header-icon {
    width: 32px; height: 32px;
    background: var(--saffron-pale);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .notif-header h3 {
    font-size: 15px;
    font-weight: 600;
    color: var(--navy);
  }
  .latest-pill {
    background: var(--saffron);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
  }
  .notif-body { padding: 8px 0; }
  .notif-item {
    display: flex;
    gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--bg); }
  .notif-item.unread::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--saffron);
    border-radius: 0 2px 2px 0;
  }
  .notif-type-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-top: 6px;
    flex-shrink: 0;
  }
  .notif-type-dot.alert { background: var(--red); }
  .notif-type-dot.info { background: var(--navy); }
  .notif-type-dot.update { background: var(--green); }
  .notif-content { flex: 1; min-width: 0; }
  .notif-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 3px;
    line-height: 1.4;
  }
  .notif-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
  .notif-time { font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }
  .notif-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-light);
    text-align: center;
  }
  .view-all-btn {
    font-size: 13px;
    font-weight: 600;
    color: var(--navy);
    background: none;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s;
  }
  .view-all-btn:hover { color: var(--saffron); }

  /* Schemes card */
  .schemes-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .schemes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border-light);
  }
  .schemes-header h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--navy);
  }
  .schemes-list { padding: 0; }
  .scheme-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border-light);
    cursor: pointer;
    transition: background 0.2s;
  }
  .scheme-row:last-child { border-bottom: none; }
  .scheme-row:hover { background: var(--bg); }
  .scheme-icon-wrap {
    width: 34px; height: 34px;
    background: var(--navy-pale);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .scheme-info { flex: 1; }
  .scheme-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .scheme-tag { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
  .scheme-arrow { color: var(--text-muted); font-size: 14px; transition: transform 0.2s; }
  .scheme-row:hover .scheme-arrow { transform: translateX(3px); color: var(--navy); }

  /* ─── STATS BAR ─── */
  .stats-bar {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
    border-radius: var(--radius);
    padding: 28px 36px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 28px;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
  }
  .stats-bar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--saffron) 0%, var(--saffron-light) 50%, var(--green) 100%);
  }
  .stat-block { text-align: center; flex: 1; min-width: 120px; }
  .stat-num {
    font-family: 'EB Garamond', serif;
    font-size: 34px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 5px;
  }
  .stat-lbl {
    font-size: 11.5px;
    color: rgba(255,255,255,0.5);
    font-weight: 500;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .stat-divider-v {
    width: 1px;
    height: 44px;
    background: rgba(255,255,255,0.1);
    flex-shrink: 0;
  }
  @media (max-width: 600px) { .stat-divider-v { display: none; } }

  /* ─── CITIZEN CORNER ─── */
  .citizen-corner {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    border-left: 4px solid var(--green);
  }
  .citizen-corner-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .citizen-corner-header h3 {
    font-family: 'EB Garamond', serif;
    font-size: 19px;
    font-weight: 600;
    color: var(--navy);
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .citizen-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .citizen-link {
    background: var(--bg);
    color: var(--text-secondary);
    padding: 9px 18px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.22s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .citizen-link:hover {
    background: var(--navy);
    color: #fff;
    border-color: var(--navy);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(10,22,40,0.15);
  }
  .citizen-link-icon { font-size: 14px; }

  /* ─── CAMERA ACTIVE STATE ─── */
  .camera-active-placeholder {
    background: var(--navy-pale);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 40px 20px;
    text-align: center;
    color: var(--text-muted);
  }
  .camera-active-placeholder .cam-icon { font-size: 36px; margin-bottom: 10px; }

  /* ─── ANIMATIONS ─── */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in-up { animation: fadeInUp 0.45s ease both; }
  .delay-1 { animation-delay: 0.07s; }
  .delay-2 { animation-delay: 0.14s; }
  .delay-3 { animation-delay: 0.21s; }
  .delay-4 { animation-delay: 0.28s; }
  .delay-5 { animation-delay: 0.35s; }

  @media (max-width: 768px) {
    .emergency-hero { flex-direction: column; padding: 28px 24px; }
    .hero-stats { width: 100%; }
    .hero-title { font-size: 26px; }
    .portal-main { padding: 20px 16px 40px; }
    .stats-bar { padding: 20px 16px; }
    .stat-num { font-size: 26px; }
  }
`;

// Dummy CameraReporter placeholder
function CameraReporter({ mode }) {
    return (
        <div className="camera-active-placeholder">
            <div className="cam-icon">📷</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0A1628', marginBottom: 4 }}>
                Camera Capture Interface
            </div>
            <div style={{ fontSize: 12, color: '#718096' }}>
                Mode: <strong>{mode === 'emergency' ? 'Emergency' : 'Regular'}</strong> — Camera component loads here
            </div>

            <WasteBotWidget />
        </div>
    );
}



export function Home() {
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState("emergency");

    const handleEmergencyReport = () => {
        setCameraMode("emergency");
        setShowCamera(true);
        setTimeout(() => {
            document.querySelector(".camera-reporter-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <div className="portal-body">
            <style>{styles}</style>

            {/* Alert Ticker
            <div className="alert-ticker">
                <div className="alert-ticker-inner">
                    <div className="ticker-label">⚡ Live</div>
                    <div className="ticker-scroll">
                        <span className="ticker-text">
                            Advisory: Heavy rainfall expected in coastal regions — stay alert
                            <span className="ticker-sep">•</span>
                            Women Helpline 181 now available 24/7 in 12 languages
                            <span className="ticker-sep">•</span>
                            Nirbhaya Fund: New schemes announced for safe transport
                            <span className="ticker-sep">•</span>
                            Community Policing volunteer drive open until March 31
                            <span className="ticker-sep">•</span>
                            Emergency response time improved to under 8 minutes citywide
                        </span>
                    </div>
                </div>
            </div> */}

            <div className="portal-main">

                {/* Emergency Hero */}
            
                {/* Quick Services */}
                <div className="services-section fade-in-up delay-1">
                    <div className="section-label">
                        <div className="section-label-line"></div>
                        <h2>Quick Citizen Services</h2>
                        <div className="section-label-tag">सेवाएं</div>
                    </div>
                    <div className="services-grid">
                        <div className="service-card emergency fade-in-up delay-1">
                            <div className="sc-icon-wrap emergency">🚨</div>
                            <div className="sc-title">Emergency Reporting</div>
                            <div className="sc-desc">Immediate assistance with priority response from nearest police station.</div>
                            <button className="sc-btn emergency" onClick={handleEmergencyReport}>
                                Report Now →
                            </button>
                        </div>
                        <a href="/filecom" style={{ display: 'contents' }}>
                            <div className="service-card complaint fade-in-up delay-2">
                                <div className="sc-icon-wrap complaint">📋</div>
                                <div className="sc-title">File Complaint</div>
                                <div className="sc-desc">Lodge an online FIR or formal complaint with document support.</div>
                                <button className="sc-btn complaint">File Complaint →</button>
                            </div>
                        </a>
                        <a href="/track" style={{ display: 'contents' }}>
                            <div className="service-card track fade-in-up delay-3">
                                <div className="sc-icon-wrap track">📊</div>
                                <div className="sc-title">Track Status</div>
                                <div className="sc-desc">Real-time status updates on your complaints and filed reports.</div>
                                <button className="sc-btn track">Track Status →</button>
                            </div>
                        </a>
                        <a href="/safety" style={{ display: 'contents' }}>
                            <div className="service-card safety fade-in-up delay-4">
                                <div className="sc-icon-wrap safety">📚</div>
                                <div className="sc-title">Safety Guidelines</div>
                                <div className="sc-desc">Official government advisories, safety tips, and public notices.</div>
                                <button className="sc-btn safety">View Guidelines →</button>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="content-grid camera-reporter-section fade-in-up delay-2">

                    {/* Left: Camera + Contacts */}
                    <div>
                        <div className="camera-card">
                            <div className="card-top-bar">
                                <div className="card-top-bar-title">
                                    <div className="card-top-bar-icon">📷</div>
                                    {showCamera ? "Camera Incident Report — Emergency Mode" : "Camera Incident Report"}
                                </div>
                                <div className="official-badge">
                                    <div className="tricolor-bar">
                                        <span className="tc-s"></span>
                                        <span className="tc-w"></span>
                                        <span className="tc-g"></span>
                                    </div>
                                    Official Portal
                                </div>
                            </div>
                            <div className="card-body-pad">
                                {showCamera ? (
                                    <div>
                                        <div className="emergency-mode-banner">
                                            <div className="emb-dot"></div>
                                            <div>
                                                <div className="emb-text">Emergency Mode Active</div>
                                                <div className="emb-sub">Your report will be prioritised and routed immediately</div>
                                            </div>
                                        </div>
                                        <CameraReporter mode={cameraMode} />
                                        <div className="camera-controls-row">
                                            <button className="btn-ctrl outline" onClick={() => setShowCamera(false)}>
                                                ✕ Close Camera
                                            </button>
                                            <button className="btn-ctrl muted" onClick={() => setCameraMode("regular")}>
                                                ↔ Switch to Regular Mode
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="camera-prompt-box">
                                            <div className="cp-icon">📷</div>
                                            <div className="cp-title">Camera Reporting System</div>
                                            <p className="cp-desc">Use the camera to capture and submit incident evidence directly to the nearest police station.</p>
                                            <div className="cp-hint">💡 Use "Emergency Report" above for priority reporting</div>
                                        </div>
                                        <div style={{ marginTop: 16 }}>
                                            <CameraReporter mode="regular" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="card-foot">
                                🔒 Secured by Government of India · End-to-end encrypted
                            </div>
                        </div>

                        {/* Contacts */}
                        <div className="contacts-card">
                            <div className="contacts-card-header">
                                <span>📞</span>
                                <h4>Important Helpline Numbers</h4>
                            </div>
                            <div className="contacts-list">
                                {[
                                    { name: "Women Helpline", num: "181" },
                                    { name: "Child Helpline", num: "1098" },
                                    { name: "Police Control Room", num: "100" },
                                    { name: "Disaster Management", num: "1078" },
                                ].map((c, i) => (
                                    <div className="contact-row" key={i}>
                                        <div className="contact-info">
                                            <div className="contact-dot"></div>
                                            <div className="contact-name">{c.name}</div>
                                        </div>
                                        <div className="contact-num">{c.num}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Notifications + Schemes */}
                    <div className="right-col">
                        <div className="notif-card">
                            <div className="notif-header">
                                <div className="notif-header-left">
                                    <div className="notif-header-icon">📢</div>
                                    <h3>Notifications</h3>
                                </div>
                                <div className="latest-pill">Live</div>
                            </div>
                      
                            <div className="notif-footer">
                                <a href="/notifications">
                                    <button className="view-all-btn">View All Notifications →</button>
                                </a>
                            </div>
                        </div>

                        <div className="schemes-card">
                            <div className="schemes-header">
                                <h4>🏛️ Government Schemes</h4>
                            </div>
                            <div className="schemes-list">
                                {[
                                    { icon: "🛡️", name: "Nirbhaya Fund", tag: "Women Safety" },
                                    { icon: "👮", name: "Safe City Project", tag: "Urban Security" },
                                    { icon: "👨‍👩‍👧‍👦", name: "Community Policing", tag: "Public Engagement" },
                                    { icon: "🎓", name: "Women Safety Awareness", tag: "Education & Outreach" },
                                ].map((s, i) => (
                                    <div className="scheme-row" key={i}>
                                        <div className="scheme-icon-wrap">{s.icon}</div>
                                        <div className="scheme-info">
                                            <div className="scheme-name">{s.name}</div>
                                            <div className="scheme-tag">{s.tag}</div>
                                        </div>
                                        <div className="scheme-arrow">›</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="stats-bar fade-in-up delay-3">
                    {[
                        { num: "5,000+", lbl: "CCTV Cameras" },
                        { num: "98.5%", lbl: "Response Rate" },
                        { num: "24/7", lbl: "Monitoring" },
                        { num: "1.2M+", lbl: "Citizens Served" },
                    ].map((s, i) => (
                        <>
                            <div className="stat-block" key={s.lbl}>
                                <div className="stat-num">{s.num}</div>
                                <div className="stat-lbl">{s.lbl}</div>
                            </div>
                            {i < 3 && <div className="stat-divider-v" key={`d${i}`}></div>}
                        </>
                    ))}
                </div>

                {/* Citizen Corner */}
                <div className="citizen-corner fade-in-up delay-4">
                    <div className="citizen-corner-header">
                        <h3>👥 Citizen's Corner</h3>
                    </div>
                    <div className="citizen-links">
                        {[
                            { icon: "📄", label: "Download Forms" },
                            { icon: "❓", label: "FAQs" },
                            { icon: "📣", label: "Grievance Redressal" },
                            { icon: "💬", label: "Feedback" },
                            { icon: "📜", label: "RTI" },
                        ].map((l, i) => (
                            <a href="#" className="citizen-link" key={i}>
                                <span className="citizen-link-icon">{l.icon}</span>
                                {l.label}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Home;
