import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-member-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="page-hero">
    <h1>My Library Account</h1>
    <p>Track your borrowed books, reservations, and fines</p>
    <div class="khmer-divider"><span>❦ ✦ ❦</span></div>
  </div>

  <div class="account-body">
    <!-- Borrowing history -->
    <div class="section-card">
      <div class="section-title">
        <span class="icon">❧</span>
        <h2>Borrowing History</h2>
      </div>
      <div class="gold-strip"></div>
      <table class="table" *ngIf="history().length; else emptyHistory">
        <thead><tr><th>Book Title</th><th>Issued</th><th>Due Date</th><th>Returned</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let h of history()">
            <td><strong>{{ h.title }}</strong></td>
            <td>{{ h.issue_date | date:'MMM d, y' }}</td>
            <td [class.overdue]="isOverdue(h)">{{ h.due_date ? (h.due_date | date:'MMM d, y') : '—' }}</td>
            <td>{{ h.return_date ? (h.return_date | date:'MMM d, y') : '—' }}</td>
            <td><span class="badge" [ngClass]="statusClass(h.status)">{{ h.status }}</span></td>
          </tr>
        </tbody>
      </table>
      <ng-template #emptyHistory>
        <div class="empty-box"><div class="e-icon">❧</div><p>No borrowing history yet.</p></div>
      </ng-template>
    </div>

    <!-- Fines -->
    <div class="section-card" *ngIf="memberId()">
      <div class="section-title">
        <span class="icon">◉</span>
        <h2>My Fines</h2>
      </div>
      <div class="gold-strip"></div>
      <table class="table" *ngIf="fines().length; else emptyFines">
        <thead><tr><th>Book</th><th>Fine Amount</th><th>Paid</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let f of fines()">
            <td>{{ f.title }}</td>
            <td class="amount">\${{ f.amount }}</td>
            <td>\${{ f.amount_paid }}</td>
            <td><span class="badge" [ngClass]="fineClass(f.status)">{{ f.status }}</span></td>
          </tr>
        </tbody>
      </table>
      <ng-template #emptyFines>
        <div class="empty-box"><div class="e-icon">◉</div><p>No outstanding fines. Great job!</p></div>
      </ng-template>
    </div>
  </div>
  `,
  styles: [`
    .page-hero{background:linear-gradient(135deg,#12080A,#3D0808);color:#fff;text-align:center;padding:40px 24px 30px;}
    .page-hero h1{font-family:'Cinzel',serif;font-size:1.8rem;margin-bottom:8px;}
    .page-hero p{color:#C4A882;font-size:0.88rem;margin-bottom:14px;}
    .khmer-divider{display:flex;align-items:center;gap:10px;margin:10px auto 0;max-width:280px;}
    .khmer-divider::before,.khmer-divider::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(200,148,10,0.5),transparent);}
    .khmer-divider span{color:#C8940A;font-size:1rem;letter-spacing:0.3em;}

    .account-body{padding:28px 48px;display:flex;flex-direction:column;gap:22px;}
    .section-card{background:#fff;border-radius:14px;border:1px solid var(--parchment-dk);padding:22px;box-shadow:0 2px 12px rgba(18,8,10,0.06);}
    .section-title{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
    .icon{color:var(--gold);font-size:1.2rem;}
    .section-title h2{font-family:'Cinzel',serif;color:var(--garnet);font-size:1.1rem;}
    .gold-strip{height:2px;background:linear-gradient(90deg,var(--garnet),var(--gold),transparent);border-radius:2px;margin-bottom:16px;}
    .overdue{color:#DC2626;font-weight:700;}
    .amount{font-weight:700;color:var(--garnet);}
    .empty-box{text-align:center;padding:30px;color:var(--stone-light);}
    .e-icon{font-size:2rem;color:var(--gold);margin-bottom:8px;}
    @media(max-width:600px){.account-body{padding:16px;}}
  `]
})
export class MemberReservationsComponent implements OnInit {
  history  = signal<any[]>([]);
  fines    = signal<any[]>([]);
  memberId = signal<number|null>(null);

  constructor(private api: ApiService, public auth: AuthService){}

  ngOnInit(){
    const mid = this.auth.currentUser()?.member_id;
    if(!mid) return;
    this.memberId.set(mid);
    this.api.get<any[]>(`/members/${mid}/history`).subscribe(h => this.history.set(h));
    this.api.get<any[]>(`/circulation/fines/member/${mid}`).subscribe(f => this.fines.set(f));
  }

  isOverdue(h: any){ return h.status === 'Borrowed' && h.due_date && new Date(h.due_date) < new Date(); }
  statusClass(s: string){ return s==='Returned'?'badge-green':s==='Borrowed'?'badge-blue':s==='Overdue'?'badge-amber':'badge-red'; }
  fineClass(s: string){ return s==='Paid'?'badge-green':s==='Partial'?'badge-amber':'badge-red'; }
}
