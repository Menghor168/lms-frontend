import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="screen">
    <div class="left">
      <div class="left-inner">
        <div class="logo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
        <div class="logo-name">LMS Pro</div>
        <h1>The smarter way to manage your library.</h1>
        <p>Track books, members, and transactions in real time — all in one place.</p>
        <div class="features">
          <div class="feat"><div class="feat-dot"></div>Role-based access for Staff & Members</div>
          <div class="feat"><div class="feat-dot"></div>Real-time book availability tracking</div>
          <div class="feat"><div class="feat-dot"></div>Automated overdue alerts & fines</div>
          <div class="feat"><div class="feat-dot"></div>Excel & PDF report generation</div>
        </div>
        <div class="stats">
          <div class="stat"><div class="stat-v">12,450</div><div class="stat-l">Books</div></div>
          <div class="stat-div"></div>
          <div class="stat"><div class="stat-v">3,500</div><div class="stat-l">Members</div></div>
          <div class="stat-div"></div>
          <div class="stat"><div class="stat-v">99.9%</div><div class="stat-l">Uptime</div></div>
        </div>
      </div>
    </div>

    <div class="right">
      <form class="form-card" (ngSubmit)="submit()">
        <div class="form-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <label class="label">Username</label>
        <input class="input" name="username" [(ngModel)]="username" placeholder="Enter your username" autocomplete="username" required />

        <label class="label" style="margin-top:16px;">Password</label>
        <input class="input" type="password" name="password" [(ngModel)]="password" placeholder="Enter your password" autocomplete="current-password" required />

        <div *ngIf="error()" class="error-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ error() }}
        </div>

        <button class="submit-btn" [disabled]="loading()">
          <span *ngIf="!loading()">Sign in</span>
          <span *ngIf="loading()" class="loading-row">
            <span class="spinner"></span> Signing in...
          </span>
        </button>

        <div class="divider"><span>or</span></div>
        <p class="register-link">New here? <a routerLink="/register">Create a member account →</a></p>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .screen { display:flex; min-height:100vh; }

    /* Left */
    .left {
      flex:1.1; background:linear-gradient(135deg, var(--blue-950) 0%, var(--blue-900) 40%, var(--blue-800) 100%);
      display:flex; align-items:center; justify-content:center; padding:60px 56px;
      position:relative; overflow:hidden;
    }
    .left::before {
      content:''; position:absolute; inset:0;
      background: radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.15) 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.12) 0%, transparent 60%);
    }
    .left-inner { position:relative; max-width:440px; }
    .logo { width:44px; height:44px; border-radius:12px; background:var(--blue-600); display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
    .logo-name { font-size:1.1rem; font-weight:800; color:#fff; margin-bottom:28px; letter-spacing:-0.02em; }
    .left h1 { font-size:2rem; font-weight:800; color:#fff; line-height:1.2; margin-bottom:14px; letter-spacing:-0.03em; }
    .left p  { color:var(--blue-300); font-size:0.9rem; line-height:1.65; margin-bottom:28px; }
    .features { display:flex; flex-direction:column; gap:10px; margin-bottom:36px; }
    .feat { display:flex; align-items:center; gap:10px; color:var(--blue-200); font-size:0.85rem; }
    .feat-dot { width:6px; height:6px; border-radius:50%; background:var(--blue-400); flex-shrink:0; }
    .stats { display:flex; align-items:center; gap:24px; }
    .stat { display:flex; flex-direction:column; gap:2px; }
    .stat-v { font-size:1.4rem; font-weight:800; color:#fff; letter-spacing:-0.02em; }
    .stat-l { font-size:0.7rem; color:var(--blue-400); font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
    .stat-div { width:1px; height:32px; background:rgba(255,255,255,0.15); }

    /* Right */
    .right { flex:1; display:flex; align-items:center; justify-content:center; background:var(--slate-50); padding:40px; }
    .form-card { width:100%; max-width:380px; background:var(--white); border-radius:20px; padding:36px; border:1px solid var(--slate-200); box-shadow:var(--shadow-lg); }
    .form-header { margin-bottom:24px; }
    .form-header h2 { font-size:1.5rem; color:var(--slate-900); font-weight:800; margin-bottom:4px; letter-spacing:-0.02em; }
    .form-header p  { color:var(--slate-500); font-size:0.85rem; }

    .error-msg { display:flex; align-items:center; gap:6px; background:var(--red-50); color:var(--red-500); font-size:0.8rem; padding:10px 12px; border-radius:var(--radius-md); margin-top:14px; border:1px solid #FECACA; }

    .submit-btn { width:100%; margin-top:22px; padding:12px; border-radius:var(--radius-md); background:var(--blue-600); color:#fff; font-weight:700; font-size:0.9rem; cursor:pointer; border:none; transition:all .15s; box-shadow:var(--shadow-blue); letter-spacing:-0.01em; }
    .submit-btn:hover { background:var(--blue-700); transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,0.35); }
    .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

    .loading-row { display:flex; align-items:center; justify-content:center; gap:8px; }
    .spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .divider { text-align:center; margin:18px 0 12px; position:relative; }
    .divider::before, .divider::after { content:''; position:absolute; top:50%; width:calc(50% - 20px); height:1px; background:var(--slate-200); }
    .divider::before { left:0; }
    .divider::after  { right:0; }
    .divider span { font-size:0.75rem; color:var(--slate-400); background:var(--white); padding:0 8px; }
    .register-link { text-align:center; font-size:0.82rem; color:var(--slate-500); }
    .register-link a { color:var(--blue-600); font-weight:600; }
    .register-link a:hover { color:var(--blue-700); }

    @media(max-width:860px) { .left { display:none; } }
  `]
})
export class LoginComponent {
  username=''; password='';
  loading=signal(false); error=signal('');
  constructor(private auth: AuthService, private router: Router){}
  submit(){
    if(!this.username||!this.password) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.username,this.password).subscribe({
      next:(res)=>{ this.auth.setSession(res); this.loading.set(false); this.auth.redirectAfterLogin(); },
      error:(err)=>{ this.loading.set(false); this.error.set(err?.error?.message||'Invalid username or password.'); }
    });
  }
}
