import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Fine } from '../../core/models/models';

@Component({
  selector: 'app-fines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Fine Management</h1>
      <p class="page-subtitle">Track and process penalty payments for late returns, damage, or lost books.</p>
    </div>
  </div>

  <!-- KPI row -->
  <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 20px;">
    <div class="card kpi-card">
      <span class="kpi-label">Total Fines</span>
      <span class="kpi-value">{{ total() | currency }}</span>
    </div>
    <div class="card kpi-card">
      <span class="kpi-label">Collected</span>
      <span class="kpi-value" style="color: var(--green-600);">{{ collected() | currency }}</span>
    </div>
    <div class="card kpi-card">
      <span class="kpi-label">Outstanding</span>
      <span class="kpi-value" style="color: var(--red-600);">{{ outstanding() | currency }}</span>
    </div>
  </div>

  <div class="card">
    <div class="table-header">
      <h3>Fine Records</h3>
      <select class="input" style="width:160px;" [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()">
        <option value="">All statuses</option>
        <option value="Unpaid">Unpaid</option>
        <option value="Partial">Partial</option>
        <option value="Paid">Paid</option>
      </select>
    </div>
    <table class="table">
      <thead>
        <tr><th>#</th><th>Book</th><th>Member</th><th>Fine Amount</th><th>Paid</th><th>Method</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let f of filteredFines()">
          <td class="dim">#{{ f.fine_id }}</td>
          <td>{{ f.title }}</td>
          <td>{{ f.member_name }}</td>
          <td class="amount">{{ f.amount | currency }}</td>
          <td>{{ f.amount_paid | currency }}</td>
          <td>{{ f.payment_method || '—' }}</td>
          <td>
            <span class="badge" [ngClass]="statusClass(f.status)">{{ f.status }}</span>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" *ngIf="f.status !== 'Paid'" (click)="openPay(f)">Pay</button>
          </td>
        </tr>
        <tr *ngIf="!filteredFines().length"><td colspan="8" class="empty">No fines found.</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Pay modal -->
  <div class="overlay" *ngIf="payOpen()" (click)="payOpen.set(false)">
    <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="pay()">
      <h3>Record Payment</h3>
      <div class="fine-summary">
        <div class="row"><span>Book</span><strong>{{ payingFine()?.title }}</strong></div>
        <div class="row"><span>Member</span><strong>{{ payingFine()?.member_name }}</strong></div>
        <div class="row"><span>Total fine</span><strong>{{ payingFine()?.amount | currency }}</strong></div>
        <div class="row"><span>Already paid</span><strong>{{ payingFine()?.amount_paid | currency }}</strong></div>
        <div class="row highlight"><span>Remaining</span><strong>{{ remaining() | currency }}</strong></div>
      </div>

      <label class="label">Payment amount ($)</label>
      <input class="input" type="number" name="amount_paid" [(ngModel)]="payForm.amount_paid" [max]="remaining()" required />

      <label class="label" style="margin-top:14px;">Payment method</label>
      <div class="method-grid">
        <label *ngFor="let m of methods" class="method-btn" [class.selected]="payForm.payment_method === m.value">
          <input type="radio" name="method" [value]="m.value" [(ngModel)]="payForm.payment_method" />
          <span>{{ m.icon }}</span> {{ m.label }}
        </label>
      </div>

      <div *ngIf="payResult()" class="result-box" [class.error-box]="payError()">{{ payResult() }}</div>

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="payOpen.set(false)">Cancel</button>
        <button type="submit" class="btn btn-primary" [disabled]="payLoading()">
          {{ payLoading() ? 'Processing...' : 'Confirm Payment' }}
        </button>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .table-header h3 { font-size: 0.95rem; }
    .amount { font-weight: 700; color: var(--navy-900); }
    .dim { color: var(--slate-400); }
    .empty { text-align: center; color: var(--slate-400); padding: 24px 0; }
    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal { width: 420px; }
    .modal h3 { margin-bottom: 16px; }
    .fine-summary { background: var(--slate-50); border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; display: flex; flex-direction: column; gap: 8px; }
    .fine-summary .row { display: flex; justify-content: space-between; font-size: 0.84rem; color: var(--slate-700); }
    .fine-summary .highlight strong { color: var(--red-600); font-size: 1rem; }
    .method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
    .method-btn { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border: 2px solid var(--slate-200); border-radius: 9px; cursor: pointer; font-size: 0.82rem; font-weight: 600; }
    .method-btn input { display: none; }
    .method-btn.selected { border-color: var(--blue-600); background: var(--blue-50); color: var(--blue-600); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .result-box { background: var(--green-50); color: var(--green-600); font-size: 0.84rem; padding: 10px 14px; border-radius: 9px; margin-top: 14px; font-weight: 600; }
    .error-box { background: var(--red-50); color: var(--red-600); }
  `]
})
export class FinesComponent implements OnInit {
  fines = signal<Fine[]>([]);
  filteredFines = signal<Fine[]>([]);
  filterStatus = '';

  payOpen = signal(false);
  payingFine = signal<Fine | null>(null);
  payForm: { amount_paid: number; payment_method: string } = { amount_paid: 0, payment_method: 'Cash' };
  payLoading = signal(false);
  payResult = signal('');
  payError = signal(false);

  methods = [
    { value: 'Cash', label: 'Cash', icon: '💵' },
    { value: 'Card', label: 'Card', icon: '💳' },
    { value: 'BankApp', label: 'Bank App', icon: '📱' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Fine[]>('/circulation/fines').subscribe(f => {
      this.fines.set(f);
      this.applyFilter();
    });
  }

  applyFilter() {
    const f = this.filterStatus;
    this.filteredFines.set(f ? this.fines().filter(x => x.status === f) : this.fines());
  }

  total() { return this.fines().reduce((s, f) => s + Number(f.amount), 0); }
  collected() { return this.fines().reduce((s, f) => s + Number(f.amount_paid), 0); }
  outstanding() { return this.total() - this.collected(); }
  remaining() { const f = this.payingFine(); return f ? Number(f.amount) - Number(f.amount_paid) : 0; }

  openPay(f: Fine) {
    this.payingFine.set(f);
    this.payForm = { amount_paid: this.remaining(), payment_method: 'Cash' };
    this.payResult.set('');
    this.payError.set(false);
    this.payOpen.set(true);
  }

  pay() {
    const f = this.payingFine();
    if (!f) return;
    this.payLoading.set(true);
    this.api.post(`/circulation/fines/${f.fine_id}/pay`, this.payForm).subscribe({
      next: (r: any) => {
        this.payLoading.set(false);
        this.payError.set(false);
        this.payResult.set(`✓ Payment recorded. Status: ${r.status}. Total paid: ${r.total_paid}`);
        this.load();
      },
      error: (err) => {
        this.payLoading.set(false);
        this.payError.set(true);
        this.payResult.set(err?.error?.message || 'Payment failed.');
      }
    });
  }

  statusClass(s: string) {
    switch (s) {
      case 'Paid': return 'badge-green';
      case 'Partial': return 'badge-amber';
      default: return 'badge-red';
    }
  }
}
