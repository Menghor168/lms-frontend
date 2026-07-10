import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Member } from '../../core/models/models';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Member Management</h1>
      <p class="page-subtitle">Manage library patrons, view borrowing history, and track activity.</p>
    </div>
    <div class="actions">
      <input class="input" style="width:240px;" [(ngModel)]="search" (ngModelChange)="searchMembers()" placeholder="Search name, email, username..." />
      <button class="btn btn-primary" (click)="openForm()">+ Add Member</button>
    </div>
  </div>

  <div class="card">
    <table class="table">
      <thead>
        <tr><th>Member</th><th>Username</th><th>Phone</th><th>Join Date</th><th>Status</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let m of members()">
          <td>
            <div class="member-cell">
              <div class="avatar">{{ m.full_name.charAt(0) }}</div>
              <div>
                <div class="fw">{{ m.full_name }}</div>
                <div class="sub">{{ m.email }}</div>
              </div>
            </div>
          </td>
          <td>{{ m.username }}</td>
          <td>{{ m.phone || '—' }}</td>
          <td>{{ m.join_date | date:'MMM d, y' }}</td>
          <td>
            <span class="badge" [ngClass]="{
              'badge-green': m.status === 'Active',
              'badge-amber': m.status === 'Inactive',
              'badge-red':   m.status === 'Suspended'
            }">{{ m.status }}</span>
          </td>
          <td>
            <div class="row-actions">
              <button class="btn btn-secondary btn-sm" (click)="viewHistory(m)">History</button>
              <button class="btn btn-secondary btn-sm" (click)="openForm(m)">Edit</button>
              <button class="btn btn-danger btn-sm" (click)="remove(m)">Delete</button>
            </div>
          </td>
        </tr>
        <tr *ngIf="!members().length"><td colspan="6" class="empty">No members found.</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Add/Edit form -->
  <div class="overlay" *ngIf="formOpen()" (click)="closeForm()">
    <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="save()">
      <h3>{{ editing() ? 'Edit Member' : 'Register Member' }}</h3>
      <div class="row2">
        <div><label class="label">Full name</label><input class="input" name="full_name" [(ngModel)]="form.full_name" required /></div>
        <div><label class="label">Username</label><input class="input" name="username" [(ngModel)]="form.username" [disabled]="!!editing()" required /></div>
      </div>
      <div class="row2">
        <div><label class="label">Email</label><input class="input" type="email" name="email" [(ngModel)]="form.email" required /></div>
        <div><label class="label">Phone</label><input class="input" name="phone" [(ngModel)]="form.phone" /></div>
      </div>
      <div *ngIf="!editing()">
        <label class="label">Password</label>
        <input class="input" type="password" name="password" [(ngModel)]="form.password" />
        <p class="hint">Leave blank to use default password <code>Member&#64;123</code></p>
      </div>
      <div *ngIf="editing()">
        <label class="label">Status</label>
        <select class="input" name="status" [(ngModel)]="form.status">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
        <button type="submit" class="btn btn-primary">{{ editing() ? 'Save Changes' : 'Register' }}</button>
      </div>
    </form>
  </div>

  <!-- History drawer -->
  <div class="overlay" *ngIf="historyOpen()" (click)="historyOpen.set(false)">
    <div class="card modal" (click)="$event.stopPropagation()">
      <h3>Borrowing History — {{ historyMember()?.full_name }}</h3>
      <table class="table" style="margin-top:14px;">
        <thead><tr><th>Book</th><th>Issued</th><th>Returned</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let h of history()">
            <td>{{ h.title }}</td>
            <td>{{ h.issue_date | date:'MMM d, y' }}</td>
            <td>{{ h.return_date ? (h.return_date | date:'MMM d, y') : '—' }}</td>
            <td><span class="badge" [ngClass]="statusClass(h.status)">{{ h.status }}</span></td>
          </tr>
          <tr *ngIf="!history().length"><td colspan="4" class="empty">No borrowing history.</td></tr>
        </tbody>
      </table>
      <div class="modal-actions"><button class="btn btn-secondary" (click)="historyOpen.set(false)">Close</button></div>
    </div>
  </div>
  `,
  styles: [`
    .actions { display: flex; gap: 10px; }
    .member-cell { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--blue-50); color: var(--blue-600); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.82rem; flex-shrink:0; }
    .fw { font-weight: 600; font-size: 0.85rem; }
    .sub { font-size: 0.74rem; color: var(--slate-500); }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
    .empty { text-align: center; color: var(--slate-400); padding: 24px 0; }
    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal { width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal h3 { margin-bottom: 16px; }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .hint { font-size: 0.74rem; color: var(--slate-500); margin-top: 4px; }
    code { background: var(--slate-100); padding: 1px 5px; border-radius: 4px; }
  `]
})
export class MembersComponent implements OnInit {
  members = signal<Member[]>([]);
  search = '';
  formOpen = signal(false);
  editing = signal<Member | null>(null);
  form: any = {};

  historyOpen = signal(false);
  historyMember = signal<Member | null>(null);
  history = signal<any[]>([]);

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Member[]>('/members').subscribe(m => this.members.set(m));
  }

  searchMembers() {
    if (!this.search.trim()) { this.load(); return; }
    this.api.get<Member[]>('/members/search', { q: this.search }).subscribe(m => this.members.set(m));
  }

  openForm(m?: Member) {
    this.editing.set(m || null);
    this.form = m ? { full_name: m.full_name, email: m.email, phone: m.phone, status: m.status } : { full_name: '', username: '', email: '', phone: '', password: '' };
    this.formOpen.set(true);
  }
  closeForm() { this.formOpen.set(false); }

  save() {
    const e = this.editing();
    const req = e ? this.api.put(`/members/${e.member_id}`, this.form) : this.api.post('/members', this.form);
    req.subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: (err) => alert(err?.error?.message || 'Failed to save member.')
    });
  }

  remove(m: Member) {
    if (!confirm(`Remove member "${m.full_name}"?`)) return;
    this.api.delete(`/members/${m.member_id}`).subscribe(() => this.load());
  }

  viewHistory(m: Member) {
    this.historyMember.set(m);
    this.historyOpen.set(true);
    this.api.get<any[]>(`/members/${m.member_id}/history`).subscribe(h => this.history.set(h));
  }

  statusClass(s: string) {
    switch (s) {
      case 'Returned': return 'badge-green';
      case 'Borrowed': return 'badge-blue';
      case 'Overdue': return 'badge-amber';
      default: return 'badge-red';
    }
  }
}
