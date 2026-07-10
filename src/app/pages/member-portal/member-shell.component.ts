import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-member-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
  <div class="portal">
    <header class="nav">
      <div class="nav-inner">
        <div class="brand">
          <div class="brand-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
          <span class="brand-name">LMS Pro</span>
        </div>
        <nav class="links">
          <a routerLink="/member" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="link">Home</a>
          <a routerLink="/member/catalog" routerLinkActive="active" class="link">Catalogue</a>
          <a routerLink="/member/reservations" routerLinkActive="active" class="link">My Books</a>
        </nav>
        <div class="user-area">
          <div class="avatar">{{ initial() }}</div>
          <div class="uinfo">
            <div class="uname">{{ auth.currentUser()?.full_name }}</div>
            <div class="urole">Member</div>
          </div>
          <button class="logout" (click)="auth.logout()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </header>
    <main class="main"><router-outlet></router-outlet></main>
    <footer class="footer">
      <div class="footer-brand">
        <div class="brand-icon sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
        <span>LMS Pro</span>
      </div>
      <p>© 2025 Library Management System. All rights reserved.</p>
    </footer>
  </div>
  `,
  styles: [`
    .portal { min-height:100vh; display:flex; flex-direction:column; background:var(--slate-50); }

    .nav { background:var(--white); border-bottom:1px solid var(--slate-200); position:sticky; top:0; z-index:20; box-shadow:0 1px 3px rgba(15,23,42,0.06); }
    .nav-inner { max-width:1280px; margin:0 auto; padding:0 28px; display:flex; align-items:center; height:60px; gap:24px; }
    .brand { display:flex; align-items:center; gap:8px; flex-shrink:0; }
    .brand-icon { width:32px; height:32px; border-radius:9px; background:var(--blue-600); display:flex; align-items:center; justify-content:center; }
    .brand-icon.sm { width:24px; height:24px; border-radius:6px; }
    .brand-name { font-weight:800; font-size:0.95rem; color:var(--slate-900); letter-spacing:-0.02em; }

    .links { display:flex; gap:4px; flex:1; justify-content:center; }
    .link { padding:6px 14px; border-radius:var(--radius-md); font-size:0.85rem; font-weight:500; color:var(--slate-600); transition:all .15s; }
    .link:hover { background:var(--blue-50); color:var(--blue-700); }
    .link.active { background:var(--blue-600); color:#fff; font-weight:600; }

    .user-area { display:flex; align-items:center; gap:10px; flex-shrink:0; }
    .avatar { width:32px; height:32px; border-radius:50%; background:var(--blue-600); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem; flex-shrink:0; }
    .uinfo { display:flex; flex-direction:column; }
    .uname { font-size:0.8rem; font-weight:600; color:var(--slate-800); }
    .urole { font-size:0.65rem; color:var(--slate-500); }
    .logout { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--slate-500); transition:all .15s; border:1px solid var(--slate-200); }
    .logout:hover { background:var(--red-50); color:var(--red-500); border-color:#FECACA; }

    .main { flex:1; }

    .footer { background:var(--slate-900); color:var(--slate-400); padding:24px 28px; text-align:center; }
    .footer-brand { display:flex; align-items:center; justify-content:center; gap:7px; margin-bottom:6px; }
    .footer-brand span { font-weight:700; color:#fff; font-size:0.9rem; }
    .footer p { font-size:0.78rem; }

    @media(max-width:640px) { .links { display:none; } .uinfo { display:none; } }
  `]
})
export class MemberShellComponent {
  constructor(public auth: AuthService){}
  initial(){ return (this.auth.currentUser()?.full_name||'?').charAt(0).toUpperCase(); }
}
