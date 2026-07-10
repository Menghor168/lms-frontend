import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardSummary } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<ng-container *ngIf="s() as d; else loading">

  <!-- Top greeting bar -->
  <div class="greeting-bar">
    <div>
      <h1 class="page-title">Institutional Dashboard</h1>
      <p class="page-subtitle">Real-time overview of your library's assets and activity.</p>
    </div>
    <div class="top-actions">
      <a routerLink="/reports" class="btn btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Generate Report
      </a>
    </div>
  </div>

  <!-- KPI cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
      <div class="kpi-data">
        <div class="kpi-label">Total Books</div>
        <div class="kpi-value">{{ d.total_books | number }}</div>
        <div class="kpi-sub">{{ d.available_copies }} available now</div>
      </div>
      <div class="kpi-trend up">+2.4%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon amber"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>
      <div class="kpi-data">
        <div class="kpi-label">Borrowed Assets</div>
        <div class="kpi-value">{{ d.borrowed_assets | number }}</div>
        <div class="kpi-sub">Currently checked out</div>
      </div>
      <div class="kpi-trend neutral">Active</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
      <div class="kpi-data">
        <div class="kpi-label">Active Members</div>
        <div class="kpi-value">{{ d.total_members | number }}</div>
        <div class="kpi-sub">Registered & active</div>
      </div>
      <div class="kpi-trend up">+5.1%</div>
    </div>
    <div class="kpi-card accent">
      <div class="kpi-icon white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
      <div class="kpi-data">
        <div class="kpi-label" style="color:rgba(255,255,255,.7)">Fines Collected</div>
        <div class="kpi-value" style="color:#fff">{{ d.fines_collected | currency }}</div>
        <div class="kpi-sub" style="color:rgba(255,255,255,.6)">{{ d.fines_outstanding | currency }} outstanding</div>
      </div>
    </div>
  </div>

  <!-- Main grid -->
  <div class="main-grid">

    <!-- Recent Transactions with book covers -->
    <div class="card span2">
      <div class="card-header">
        <h3>Recent Transactions</h3>
        <a routerLink="/circulation" class="see-all">View all →</a>
      </div>
      <table class="table">
        <thead><tr><th>Book</th><th>Member</th><th>Issue Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let t of d.recent_transactions">
            <td>
              <div class="book-cell">
                <div class="thumb" [style.background]="coverGradient(t.title)">
                  <img *ngIf="t.cover_image" [src]="t.cover_image" style="width:100%;height:100%;object-fit:cover;" />
                  <span *ngIf="!t.cover_image">{{ t.title.charAt(0) }}</span>
                </div>
                <span class="book-name">{{ t.title }}</span>
              </div>
            </td>
            <td>{{ t.member_name }}</td>
            <td>{{ t.issue_date | date:'MMM d, y' }}</td>
            <td><span class="badge" [ngClass]="sc(t.status)">{{ t.status }}</span></td>
          </tr>
          <tr *ngIf="!d.recent_transactions.length"><td colspan="4" class="empty">No transactions yet.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Category distribution -->
    <div class="card">
      <div class="card-header"><h3>Categories</h3></div>
      <div class="cat-list">
        <div *ngFor="let c of d.category_distribution; let i=index" class="cat-row">
          <div class="cat-dot" [style.background]="catColor(i)"></div>
          <span class="cat-name">{{ c.category_name }}</span>
          <div class="bar-wrap"><div class="bar-fill" [style.width.%]="pct(c.book_count,d.total_books)" [style.background]="catColor(i)"></div></div>
          <span class="cat-num">{{ c.book_count }}</span>
        </div>
        <div *ngIf="!d.category_distribution.length" class="empty">No categories yet.</div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="card">
      <div class="card-header"><h3>Quick Actions</h3></div>
      <div class="quick-grid">
        <a routerLink="/circulation" class="q-btn">
          <div class="q-icon blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>
          <span>Checkout / Return</span>
        </a>
        <a routerLink="/members" class="q-btn">
          <div class="q-icon green"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></div>
          <span>Add Member</span>
        </a>
        <a routerLink="/books" class="q-btn">
          <div class="q-icon purple"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></svg></div>
          <span>Add Book</span>
        </a>
        <a routerLink="/fines" class="q-btn">
          <div class="q-icon amber"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <span>Process Fine</span>
        </a>
        <a routerLink="/attendance" class="q-btn">
          <div class="q-icon cyan"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="23 11 17 17 14 14"/></svg></div>
          <span>Log Attendance</span>
        </a>
        <a routerLink="/reports" class="q-btn">
          <div class="q-icon blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
          <span>Reports</span>
        </a>
      </div>
    </div>

  </div>
</ng-container>
<ng-template #loading>
  <div class="loading-screen">
    <div class="spin"></div>
    <p>Loading dashboard...</p>
  </div>
</ng-template>
  `,
  styles: [`
    .greeting-bar { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22px; flex-wrap:wrap; gap:12px; }

    /* KPI */
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
    .kpi-card { background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:18px; display:flex; align-items:flex-start; gap:14px; box-shadow:var(--shadow-sm); position:relative; overflow:hidden; transition:box-shadow .2s; }
    .kpi-card:hover { box-shadow:var(--shadow-md); }
    .kpi-card.accent { background:linear-gradient(135deg,var(--blue-700),var(--blue-500)); border-color:transparent; }
    .kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .kpi-icon.blue   { background:var(--blue-50);  color:var(--blue-600); }
    .kpi-icon.amber  { background:var(--amber-50); color:#D97706; }
    .kpi-icon.green  { background:var(--green-50); color:#16A34A; }
    .kpi-icon.white  { background:rgba(255,255,255,.2); color:#fff; }
    .kpi-data { flex:1; }
    .kpi-label { font-size:0.72rem; font-weight:600; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px; }
    .kpi-value { font-size:1.6rem; font-weight:800; color:var(--slate-900); letter-spacing:-0.03em; line-height:1; margin-bottom:4px; }
    .kpi-sub   { font-size:0.72rem; color:var(--slate-400); }
    .kpi-trend { font-size:0.7rem; font-weight:700; padding:3px 8px; border-radius:999px; }
    .kpi-trend.up      { background:var(--green-50); color:#15803D; }
    .kpi-trend.neutral { background:var(--blue-50);  color:var(--blue-700); }

    /* Main grid */
    .main-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; align-items:start; }
    .span2 { grid-column:span 2; }

    /* Card */
    .card { background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--shadow-sm); }
    .card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .card-header h3 { font-size:0.95rem; font-weight:700; color:var(--slate-900); }
    .see-all { font-size:0.78rem; color:var(--blue-600); font-weight:600; }
    .see-all:hover { color:var(--blue-700); }

    /* Book cell */
    .book-cell { display:flex; align-items:center; gap:10px; }
    .thumb { width:36px; height:50px; border-radius:5px; background:linear-gradient(135deg,var(--blue-800),var(--blue-500)); display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:800; color:rgba(255,255,255,.9); flex-shrink:0; overflow:hidden; }
    .book-name { font-weight:600; font-size:0.84rem; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* Categories */
    .cat-list { display:flex; flex-direction:column; gap:12px; }
    .cat-row  { display:grid; grid-template-columns:10px 100px 1fr 28px; align-items:center; gap:8px; font-size:0.8rem; }
    .cat-dot  { width:8px; height:8px; border-radius:50%; }
    .cat-name { color:var(--slate-700); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bar-wrap { height:6px; border-radius:4px; background:var(--slate-100); overflow:hidden; }
    .bar-fill { height:100%; border-radius:4px; transition:width .6s ease; }
    .cat-num  { font-weight:700; color:var(--slate-900); text-align:right; font-size:0.78rem; }

    /* Quick actions */
    .quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .q-btn { display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:var(--radius-md); border:1px solid var(--slate-200); background:var(--slate-50); font-size:0.8rem; font-weight:600; color:var(--slate-700); transition:all .15s; }
    .q-btn:hover { background:var(--blue-50); border-color:var(--blue-200); color:var(--blue-700); transform:translateY(-1px); box-shadow:var(--shadow-sm); }
    .q-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .q-icon.blue   { background:var(--blue-100);  color:var(--blue-700); }
    .q-icon.green  { background:var(--green-50);  color:#15803D; }
    .q-icon.purple { background:#F3E8FF; color:#7C3AED; }
    .q-icon.amber  { background:var(--amber-50);  color:#D97706; }
    .q-icon.cyan   { background:#ECFEFF; color:#0891B2; }

    .loading-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; height:300px; gap:14px; color:var(--slate-400); }
    .spin { width:32px; height:32px; border:3px solid var(--blue-100); border-top-color:var(--blue-500); border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .empty { text-align:center; color:var(--slate-400); padding:20px 0; font-size:0.84rem; }

    @media(max-width:1100px){ .kpi-grid{grid-template-columns:repeat(2,1fr);} .main-grid{grid-template-columns:1fr 1fr;} .span2{grid-column:span 2;} }
    @media(max-width:700px) { .kpi-grid{grid-template-columns:1fr 1fr;} .main-grid{grid-template-columns:1fr;} .span2{grid-column:span 1;} }
  `]
})
export class DashboardComponent implements OnInit {
  s = signal<DashboardSummary|null>(null);
  colors = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899'];
  constructor(private api: ApiService){}
  ngOnInit(){ this.api.get<DashboardSummary>('/reports/dashboard').subscribe({ next:d=>this.s.set(d), error:()=>this.s.set({total_books:0,total_copies:0,available_copies:0,total_members:0,borrowed_assets:0,fines_collected:0,fines_outstanding:0,category_distribution:[],recent_transactions:[]}) }); }
  pct(n:number,t:number){ return t>0?Math.round(n/t*100):0; }
  sc(s:string){ return s==='Returned'?'badge-green':s==='Borrowed'?'badge-blue':s==='Overdue'?'badge-amber':'badge-red'; }
  catColor(i:number){ return this.colors[i%this.colors.length]; }
  coverGradient(title:string){ const h=title.charCodeAt(0)%360; return `linear-gradient(135deg,hsl(${h},60%,35%),hsl(${(h+40)%360},70%,55%))`; }
}
