import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="screen">
    <div class="left-panel">
      <div class="lp-brand">
        <div class="brand-mark">L</div>
        <span class="brand-name">LMS Pro</span>
      </div>
      <div class="angkor-wrap">
        <svg viewBox="0 0 400 160" fill="rgba(200,148,10,0.3)" style="width:100%;max-height:120px;">
          <polygon points="50,155 50,105 56,96 56,80 60,70 64,80 64,96 70,105 70,155"/>
          <polygon points="178,155 178,85 190,70 190,48 198,32 206,48 206,70 218,85 218,155"/>
          <polygon points="330,155 330,105 336,96 336,80 340,70 344,80 344,96 350,105 350,155"/>
          <rect x="0" y="148" width="400" height="8"/>
          <rect x="10" y="138" width="380" height="11"/>
          <rect x="80" y="127" width="240" height="12"/>
        </svg>
      </div>
      <h2>Join the Royal Library</h2>
      <p>Create your member account to search, reserve, and borrow from Cambodia's premier digital library.</p>
      <div class="features">
        <div class="feat"><span>❧</span> Browse 12,000+ books</div>
        <div class="feat"><span>◈</span> Reserve books online</div>
        <div class="feat"><span>✦</span> Track your borrowing history</div>
        <div class="feat"><span>◉</span> 24/7 online catalogue access</div>
      </div>
    </div>

    <div class="right-panel">
      <form class="reg-card" (ngSubmit)="submit()">
        <div class="form-top">
          <div class="lotus-icon">✾</div>
          <h2>Create Account</h2>
        </div>
        <div class="gold-strip"></div>

        <label class="label">Full Name</label>
        <input class="input" name="full_name" [(ngModel)]="form.full_name" placeholder="Your full name" required />

        <div class="row2">
          <div>
            <label class="label">Username</label>
            <input class="input" name="username" [(ngModel)]="form.username" placeholder="Choose a username" required />
          </div>
          <div>
            <label class="label">Phone</label>
            <input class="input" name="phone" [(ngModel)]="form.phone" placeholder="Phone number" />
          </div>
        </div>

        <label class="label">Email Address</label>
        <input class="input" type="email" name="email" [(ngModel)]="form.email" placeholder="you@example.com" required />

        <label class="label">Password</label>
        <input class="input" type="password" name="password" [(ngModel)]="form.password" placeholder="Create a password" required />

        <div *ngIf="error()" class="err-box">{{ error() }}</div>

        <button class="btn-submit" [disabled]="loading()">
          {{ loading() ? 'Creating account...' : '✦  Begin My Journey  ✦' }}
        </button>

        <div class="khmer-divider"><span>❦</span></div>
        <p class="muted">Already a member? <a routerLink="/login" class="link">Sign in here</a></p>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .screen{display:flex;min-height:100vh;}
    .left-panel{
      flex:1;background:linear-gradient(160deg,#12080A,#3D0808,#5C0F0F);
      color:#fff;padding:52px 44px;display:flex;flex-direction:column;justify-content:center;
    }
    .lp-brand{display:flex;align-items:center;gap:10px;margin-bottom:28px;}
    .brand-mark{width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#8B6A10,#C8940A);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:900;font-size:1rem;color:#fff;}
    .brand-name{font-family:'Cinzel',serif;font-weight:700;font-size:1rem;}
    .angkor-wrap{margin:0 0 20px;color:rgba(200,148,10,0.4);}
    .left-panel h2{font-family:'Cinzel',serif;font-size:1.5rem;margin-bottom:12px;}
    .left-panel p{color:#C4A882;font-size:0.86rem;line-height:1.65;margin-bottom:24px;}
    .features{display:flex;flex-direction:column;gap:10px;}
    .feat{font-size:0.84rem;color:#C4A882;display:flex;align-items:center;gap:10px;}
    .feat span{color:#C8940A;font-size:1rem;width:18px;}

    .right-panel{flex:1;display:flex;align-items:center;justify-content:center;background:var(--parchment);padding:40px;}
    .reg-card{width:100%;max-width:400px;background:#fff;border-radius:16px;padding:32px;border:1px solid var(--parchment-dk);box-shadow:0 4px 32px rgba(18,8,10,0.08);}
    .form-top{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
    .lotus-icon{font-size:1.6rem;color:var(--gold);}
    .form-top h2{font-family:'Cinzel',serif;color:var(--garnet);font-size:1.2rem;}
    .gold-strip{height:2px;background:linear-gradient(90deg,var(--garnet),var(--gold),var(--garnet));border-radius:2px;margin-bottom:20px;}
    .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
    .input{margin-bottom:14px;}
    .err-box{background:#FEF2F2;color:#DC2626;font-size:0.8rem;padding:9px 12px;border-radius:8px;margin-bottom:12px;}
    .btn-submit{width:100%;padding:13px;border-radius:9px;background:linear-gradient(135deg,#5C0F0F,#8B1A1A);color:#fff;font-family:'Cinzel',serif;font-size:0.88rem;font-weight:700;cursor:pointer;border:none;transition:all .15s;box-shadow:0 2px 10px rgba(92,15,15,0.25);margin-top:4px;}
    .btn-submit:hover{background:linear-gradient(135deg,#3D0808,#5C0F0F);}
    .btn-submit:disabled{opacity:0.5;cursor:not-allowed;}
    .khmer-divider{display:flex;align-items:center;gap:8px;margin:16px 0 10px;}
    .khmer-divider::before,.khmer-divider::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(200,148,10,0.3),transparent);}
    .khmer-divider span{color:var(--gold);font-size:0.9rem;letter-spacing:0.3em;}
    .muted{text-align:center;font-size:0.82rem;color:var(--stone);}
    .link{color:var(--gold-dim);font-weight:700;}
    .link:hover{color:var(--gold);}
    @media(max-width:860px){.left-panel{display:none;}}
  `]
})
export class RegisterComponent {
  form = { username:'', password:'', email:'', full_name:'', phone:'' };
  loading = signal(false); error = signal('');
  constructor(private auth: AuthService, private router: Router){}
  submit(){
    if(!this.form.username||!this.form.password||!this.form.email||!this.form.full_name) return;
    this.loading.set(true); this.error.set('');
    this.auth.register(this.form).subscribe({
      next:(res)=>{ this.auth.setSession(res); this.loading.set(false); this.auth.redirectAfterLogin(); },
      error:(err)=>{ this.loading.set(false); this.error.set(err?.error?.message||'Registration failed.'); }
    });
  }
}
