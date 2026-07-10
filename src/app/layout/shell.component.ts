import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div>
          <div class="brand-name">LMS Pro</div>
          <div class="brand-sub">Library System</div>
        </div>
      </div>

      <div class="nav-section-label">Main</div>
      <nav class="nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>

        <div class="nav-section-label">Catalogue</div>
        <a routerLink="/books" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Books
        </a>
        <a routerLink="/categories" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          Categories
        </a>

        <div class="nav-section-label">Operations</div>
        <a routerLink="/circulation" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          Circulation
        </a>
        <a routerLink="/fines" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Fines
        </a>
        <a routerLink="/attendance" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Attendance
        </a>

        <div class="nav-section-label">People</div>
        <a routerLink="/members" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Members
        </a>
        <a routerLink="/staff" routerLinkActive="active" class="nav-item" *ngIf="auth.isAdmin()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><path d="M12 12v9"/><path d="M8 15l4 2 4-2"/></svg>
          Staff
        </a>

        <div class="nav-section-label">Reports</div>
        <a routerLink="/reports" routerLinkActive="active" class="nav-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Reports
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-row">
          <div class="user-avatar">{{ initial() }}</div>
          <div class="user-info">
            <div class="user-name">{{ auth.currentUser()?.full_name || auth.currentUser()?.username }}</div>
            <div class="user-role">{{ auth.currentUser()?.role_type }}</div>
          </div>
        </div>
        <button class="logout-btn" (click)="auth.logout()" title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div>
          <div class="topbar-title">{{ pageTitle() }}</div>
          <div class="topbar-sub">{{ today }}</div>
        </div>
        <div class="topbar-actions">
          <div class="notif-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
        </div>
      </header>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
  </div>
  `,
  styles: [`
    .shell { display:flex; min-height:100vh; }

    /* ── Sidebar ── */
    .sidebar {
      width:220px; flex-shrink:0;
      background:linear-gradient(180deg, var(--blue-950) 0%, var(--blue-900) 100%);
      display:flex; flex-direction:column; padding:16px 10px;
      position:sticky; top:0; height:100vh; overflow-y:auto;
    }
    .brand { display:flex; align-items:center; gap:10px; padding:6px 8px 18px; }
    .brand-icon { width:34px; height:34px; border-radius:10px; background:var(--blue-600); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .brand-name { font-weight:800; font-size:0.95rem; color:#fff; letter-spacing:-0.02em; }
    .brand-sub  { font-size:0.62rem; color:var(--blue-400); font-weight:500; }

    .nav { display:flex; flex-direction:column; gap:1px; flex:1; }
    .nav-section-label { font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--blue-400); padding:12px 10px 4px; opacity:0.7; }
    .nav-item { display:flex; align-items:center; gap:9px; padding:8px 10px; border-radius:var(--radius-md); color:rgba(148,163,184,0.9); font-size:0.82rem; font-weight:500; transition:all .15s ease; }
    .nav-item:hover { background:rgba(255,255,255,0.06); color:#fff; }
    .nav-item.active { background:var(--blue-700); color:#fff; font-weight:600; box-shadow:0 2px 8px rgba(37,99,235,0.4); }
    .nav-item svg { flex-shrink:0; opacity:0.75; }
    .nav-item.active svg { opacity:1; }

    .sidebar-footer { padding:10px 0 0; border-top:1px solid rgba(255,255,255,0.08); margin-top:auto; }
    .user-row { display:flex; align-items:center; gap:9px; padding:8px; }
    .user-avatar { width:30px; height:30px; border-radius:50%; background:var(--blue-600); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.78rem; flex-shrink:0; }
    .user-info { flex:1; min-width:0; }
    .user-name { font-size:0.78rem; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .user-role { font-size:0.62rem; color:var(--blue-400); font-weight:500; }
    .logout-btn { width:28px; height:28px; border-radius:8px; color:rgba(148,163,184,0.8); display:flex; align-items:center; justify-content:center; transition:all .15s; }
    .logout-btn:hover { background:rgba(239,68,68,0.15); color:#FCA5A5; }

    /* ── Main ── */
    .main { flex:1; display:flex; flex-direction:column; min-width:0; }
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 28px; background:var(--white); border-bottom:1px solid var(--slate-200); position:sticky; top:0; z-index:10; box-shadow:0 1px 3px rgba(15,23,42,0.04); }
    .topbar-title { font-size:1rem; font-weight:700; color:var(--slate-900); }
    .topbar-sub   { font-size:0.72rem; color:var(--slate-500); margin-top:1px; }
    .topbar-actions { display:flex; align-items:center; gap:10px; }
    .notif-badge { width:36px; height:36px; border-radius:10px; border:1px solid var(--slate-200); display:flex; align-items:center; justify-content:center; color:var(--slate-500); cursor:pointer; transition:all .15s; }
    .notif-badge:hover { background:var(--blue-50); color:var(--blue-600); border-color:var(--blue-200); }
    .content { padding:24px 28px; }
  `]
})
export class ShellComponent {
  today = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  constructor(public auth: AuthService){}
  initial(){ return (this.auth.currentUser()?.full_name||this.auth.currentUser()?.username||'?').charAt(0).toUpperCase(); }
  pageTitle(){
    const p = window.location.pathname.split('/').pop()||'dashboard';
    return p.charAt(0).toUpperCase()+p.slice(1);
  }
}
