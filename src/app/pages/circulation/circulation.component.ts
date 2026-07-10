import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Transaction, Book, Member } from '../../core/models/models';

@Component({
  selector: 'app-circulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Circulation Management</h1>
      <p class="page-subtitle">Process book checkouts, returns, and monitor overdue items.</p>
    </div>
    <div class="actions">
      <button class="btn btn-primary" (click)="checkoutOpen.set(true)">+ Check Out</button>
      <button class="btn btn-secondary" (click)="loadOverdue()">⚠ Overdue Alerts</button>
    </div>
  </div>

  <!-- KPI row -->
  <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 20px;">
    <div class="card kpi-card">
      <span class="kpi-label">Total Transactions</span>
      <span class="kpi-value">{{ transactions().length }}</span>
    </div>
    <div class="card kpi-card">
      <span class="kpi-label">Currently Borrowed</span>
      <span class="kpi-value">{{ countStatus('Borrowed') }}</span>
    </div>
    <div class="card kpi-card" style="border-left: 3px solid var(--amber-600);">
      <span class="kpi-label">Overdue</span>
      <span class="kpi-value" style="color: var(--amber-600);">{{ overdueItems().length }}</span>
    </div>
  </div>

  <!-- Overdue panel -->
  <div class="card overdue-panel" *ngIf="overdueItems().length">
    <div class="panel-header">
      <h3>⚠ Overdue Items</h3>
      <button class="btn btn-secondary btn-sm" (click)="overdueItems.set([])">Dismiss</button>
    </div>
    <table class="table">
      <thead><tr><th>Book</th><th>Member</th><th>Email</th><th>Due Date</th></tr></thead>
      <tbody>
        <tr *ngFor="let o of overdueItems()">
          <td>{{ o.title }}</td>
          <td>{{ o.full_name }}</td>
          <td>{{ o.email }}</td>
          <td class="overdue-date">{{ o.due_date | date:'MMM d, y' }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Transactions table -->
  <div class="card" style="margin-top:18px;">
    <div class="table-header">
      <h3>Transaction Log</h3>
      <input class="input" style="width:220px;" [(ngModel)]="txSearch" placeholder="Filter transactions..." />
    </div>
    <table class="table">
      <thead>
        <tr><th>#</th><th>Book</th><th>Member</th><th>Issued</th><th>Due</th><th>Returned</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of filteredTx()">
          <td class="muted">#{{ t.transaction_id }}</td>
          <td>{{ t.title }}</td>
          <td>{{ t.member_name }}</td>
          <td>{{ t.issue_date | date:'MMM d, y' }}</td>
          <td [class.overdue-date]="isOverdue(t)">{{ t.due_date | date:'MMM d, y' }}</td>
          <td>{{ t.return_date ? (t.return_date | date:'MMM d, y') : '—' }}</td>
          <td><span class="badge" [ngClass]="statusClass(t.status)">{{ t.status }}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" *ngIf="t.status === 'Borrowed' || t.status === 'Overdue'" (click)="openReturn(t)">Return</button>
          </td>
        </tr>
        <tr *ngIf="!filteredTx().length"><td colspan="8" class="empty">No transactions found.</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Checkout modal -->
  <div class="overlay" *ngIf="checkoutOpen()" (click)="checkoutOpen.set(false)">
    <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="checkOut()">
      <h3>Check Out Book</h3>

      <label class="label">Select Member</label>
      <select class="input" name="member_id" [(ngModel)]="coForm.member_id" required>
        <option [ngValue]="null">— choose member —</option>
        <option *ngFor="let m of members()" [ngValue]="m.member_id">{{ m.full_name }} ({{ m.username }})</option>
      </select>

      <label class="label" style="margin-top:14px;">Select Book</label>
      <select class="input" name="book_id" [(ngModel)]="coForm.book_id" required>
        <option [ngValue]="null">— choose book —</option>
        <option *ngFor="let b of availableBooks()" [ngValue]="b.book_id">{{ b.title }} ({{ b.available_copies }} left)</option>
      </select>

      <div *ngIf="coResult()" class="result-box" [class.error-box]="coError()">{{ coResult() }}</div>

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="checkoutOpen.set(false)">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="coLoading()">
          {{ coLoading() ? 'Processing...' : 'Confirm Check Out' }}
        </button>
      </div>
    </form>
  </div>

  <!-- Return modal -->
  <div class="overlay" *ngIf="returnOpen()" (click)="returnOpen.set(false)">
    <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="processReturn()">
      <h3>Process Return</h3>
      <p class="muted">Transaction #{{ returningTx()?.transaction_id }} — <strong>{{ returningTx()?.title }}</strong></p>

      <label class="label" style="margin-top:14px;">Book Condition</label>
      <select class="input" name="condition" [(ngModel)]="returnCondition">
        <option value="Good">Good — no issues</option>
        <option value="Damaged">Damaged — charge replacement fee</option>
        <option value="Lost">Lost — charge full price</option>
      </select>

      <div *ngIf="returnResult()" class="result-box" [class.error-box]="returnError()">{{ returnResult() }}</div>

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="returnOpen.set(false)">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="returnLoading()">
          {{ returnLoading() ? 'Processing...' : 'Confirm Return' }}
        </button>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .actions { display: flex; gap: 10px; }
    .muted { color: var(--slate-500); font-size: 0.82rem; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .table-header h3 { font-size: 0.95rem; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .panel-header h3 { color: var(--amber-600); font-size: 0.95rem; }
    .overdue-panel { border-left: 3px solid var(--amber-600); margin-bottom: 18px; }
    .overdue-date { color: var(--red-600); font-weight: 600; }
    .empty { text-align: center; color: var(--slate-400); padding: 24px 0; }
    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal { width: 440px; }
    .modal h3 { margin-bottom: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .result-box { background: var(--green-50); color: var(--green-600); font-size: 0.84rem; padding: 10px 14px; border-radius: 9px; margin-top: 14px; font-weight: 600; }
    .error-box { background: var(--red-50); color: var(--red-600); }
  `]
})
export class CirculationComponent implements OnInit {
  transactions = signal<Transaction[]>([]);
  members = signal<Member[]>([]);
  books = signal<Book[]>([]);
  overdueItems = signal<any[]>([]);
  txSearch = '';

  checkoutOpen = signal(false);
  coForm: { member_id: number | null; book_id: number | null } = { member_id: null, book_id: null };
  coLoading = signal(false);
  coResult = signal('');
  coError = signal(false);

  returnOpen = signal(false);
  returningTx = signal<Transaction | null>(null);
  returnCondition = 'Good';
  returnLoading = signal(false);
  returnResult = signal('');
  returnError = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.get<Transaction[]>('/circulation/transactions').subscribe(t => this.transactions.set(t));
    this.api.get<Member[]>('/members').subscribe(m => this.members.set(m));
    this.api.get<Book[]>('/books').subscribe(b => this.books.set(b));
  }

  availableBooks() {
    return this.books().filter(b => b.available_copies > 0);
  }

  filteredTx(): Transaction[] {
    const q = this.txSearch.toLowerCase();
    if (!q) return this.transactions();
    return this.transactions().filter(t =>
      t.title.toLowerCase().includes(q) || t.member_name.toLowerCase().includes(q)
    );
  }

  countStatus(status: string) {
    return this.transactions().filter(t => t.status === status).length;
  }

  isOverdue(t: Transaction) {
    if (!t.due_date || t.status !== 'Borrowed') return false;
    return new Date(t.due_date) < new Date();
  }

  loadOverdue() {
    this.api.get<any>('/circulation/alerts/overdue').subscribe(r => this.overdueItems.set(r.overdue || []));
  }

  checkOut() {
    if (!this.coForm.member_id || !this.coForm.book_id) return;
    this.coLoading.set(true);
    this.coResult.set('');
    this.api.post('/circulation/checkout', this.coForm).subscribe({
      next: (r: any) => {
        this.coLoading.set(false);
        this.coError.set(false);
        this.coResult.set(`✓ Checked out! Due in ${r.due_in_days} days. Transaction #${r.transaction_id}`);
        this.coForm = { member_id: null, book_id: null };
        this.api.get<Transaction[]>('/circulation/transactions').subscribe(t => this.transactions.set(t));
        this.api.get<Book[]>('/books').subscribe(b => this.books.set(b));
      },
      error: (err) => {
        this.coLoading.set(false);
        this.coError.set(true);
        this.coResult.set(err?.error?.message || 'Checkout failed.');
      }
    });
  }

  openReturn(t: Transaction) {
    this.returningTx.set(t);
    this.returnCondition = 'Good';
    this.returnResult.set('');
    this.returnError.set(false);
    this.returnOpen.set(true);
  }

  processReturn() {
    const t = this.returningTx();
    if (!t) return;
    this.returnLoading.set(true);
    this.api.post(`/circulation/return/${t.transaction_id}`, { condition: this.returnCondition }).subscribe({
      next: (r: any) => {
        this.returnLoading.set(false);
        this.returnError.set(false);
        const fine = r.fine_amount > 0 ? ` Fine issued: $${r.fine_amount.toFixed(2)}` : ' No fine.';
        this.returnResult.set(`✓ Book returned. ${r.overdue_days > 0 ? `${r.overdue_days} day(s) overdue.` : ''} ${fine}`);
        this.api.get<Transaction[]>('/circulation/transactions').subscribe(tx => this.transactions.set(tx));
        this.api.get<Book[]>('/books').subscribe(b => this.books.set(b));
      },
      error: (err) => {
        this.returnLoading.set(false);
        this.returnError.set(true);
        this.returnResult.set(err?.error?.message || 'Return failed.');
      }
    });
  }

  statusClass(s: string) {
    switch (s) {
      case 'Returned': return 'badge-green';
      case 'Borrowed': return 'badge-blue';
      case 'Overdue': return 'badge-amber';
      case 'Lost': case 'Damaged': return 'badge-red';
      default: return 'badge-gray';
    }
  }
}
