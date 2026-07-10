import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Staff } from '../../core/models/models';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Staff Management</h1>
      <p class="page-subtitle">Manage library personnel, roles, and permissions.</p>
    </div>
    <button class="btn btn-primary" (click)="openForm()">+ Add Staff</button>
  </div>

  <div class="card">
    <table class="table">
      <thead>
        <tr><th>Staff Member</th><th>Username</th><th>Role</th><th>Phone</th><th></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let s of staff()">
          <td>
            <div class="staff-cell">
              <div class="avatar" [class.admin]="s.role_type === 'Admin'">{{ s.full_name.charAt(0) }}</div>
              <div>
                <div class="fw">{{ s.full_name }}</div>
                <div class="sub">{{ s.email }}</div>
              </div>
            </div>
          </td>
          <td>{{ s.username }}</td>
          <td>
            <span class="badge" [ngClass]="s.role_type === 'Admin' ? 'badge-blue' : 'badge-gray'">{{ s.role_type }}</span>
          </td>
          <td>{{ s.phone || '—' }}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-secondary btn-sm" (click)="openPerms(s)">Permissions</button>
              <button class="btn btn-secondary btn-sm" (click)="openForm(s)">Edit</button>
              <button class="btn btn-danger btn-sm" (click)="remove(s)">Delete</button>
            </div>
          </td>
        </tr>
        <tr *ngIf="!staff().length"><td colspan="5" class="empty">No staff accounts found.</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Add/Edit modal -->
  <div class="overlay" *ngIf="formOpen()" (click)="closeForm()">
    <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="save()">
      <h3>{{ editing() ? 'Edit Staff' : 'Add Staff Account' }}</h3>
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
        <input class="input" type="password" name="password" [(ngModel)]="form.password" placeholder="Temporary password" required />
      </div>
      <div>
        <label class="label">Role</label>
        <select class="input" name="role_type" [(ngModel)]="form.role_type">
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
        <button type="submit" class="btn btn-primary">{{ editing() ? 'Save Changes' : 'Create Account' }}</button>
      </div>
    </form>
  </div>

  <!-- Permissions modal -->
  <div class="overlay" *ngIf="permsOpen()" (click)="permsOpen.set(false)">
    <div class="card modal" (click)="$event.stopPropagation()">
      <h3>Permissions — {{ permsStaff()?.full_name }}</h3>
      <p class="hint">Toggle what this staff member can do:</p>
      <div class="perm-list">
        <label *ngFor="let p of permKeys" class="perm-row">
          <input type="checkbox" [(ngModel)]="perms[p]" [name]="p" />
          <span>{{ permLabels[p] }}</span>
        </label>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" (click)="permsOpen.set(false)">Cancel</button>
        <button class="btn btn-primary" (click)="savePerms()">Save Permissions</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .staff-cell { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--slate-100); color: var(--slate-700); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.82rem; flex-shrink:0; }
    .avatar.admin { background: var(--blue-50); color: var(--blue-600); }
    .fw { font-weight: 600; font-size: 0.85rem; }
    .sub { font-size: 0.74rem; color: var(--slate-500); }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
    .empty { text-align: center; color: var(--slate-400); padding: 24px 0; }
    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal { width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal h3 { margin-bottom: 16px; }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .hint { font-size: 0.8rem; color: var(--slate-500); margin-bottom: 14px; }
    .perm-list { display: flex; flex-direction: column; gap: 10px; }
    .perm-row { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer; }
    .perm-row input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--blue-600); }
  `]
})
export class StaffComponent implements OnInit {
  staff = signal<Staff[]>([]);
  formOpen = signal(false);
  editing = signal<Staff | null>(null);
  form: any = {};

  permsOpen = signal(false);
  permsStaff = signal<Staff | null>(null);
  perms: Record<string, boolean> = {};
  permKeys = ['canProcessReturns', 'canViewReports', 'canManageMembers', 'canManageBooks', 'canViewFines', 'canLogAttendance'];
  permLabels: Record<string, string> = {
    canProcessReturns: 'Process checkouts & returns',
    canViewReports: 'View reports & analytics',
    canManageMembers: 'Add, edit, and delete members',
    canManageBooks: 'Add, edit, and delete books',
    canViewFines: 'View and process fines',
    canLogAttendance: 'Log attendance entries'
  };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Staff[]>('/staff').subscribe(s => this.staff.set(s));
  }

  openForm(s?: Staff) {
    this.editing.set(s || null);
    this.form = s
      ? { full_name: s.full_name, email: s.email, phone: s.phone, role_type: s.role_type }
      : { full_name: '', username: '', email: '', phone: '', password: '', role_type: 'Staff' };
    this.formOpen.set(true);
  }
  closeForm() { this.formOpen.set(false); }

  save() {
    const e = this.editing();
    const req = e ? this.api.put(`/staff/${e.staff_id}`, this.form) : this.api.post('/staff', this.form);
    req.subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: (err) => alert(err?.error?.message || 'Failed to save staff.')
    });
  }

  remove(s: Staff) {
    if (!confirm(`Remove staff account for "${s.full_name}"?`)) return;
    this.api.delete(`/staff/${s.staff_id}`).subscribe(() => this.load());
  }

  openPerms(s: Staff) {
    this.permsStaff.set(s);
    const stored = (s as any).permissions;
    const parsed = stored ? (typeof stored === 'string' ? JSON.parse(stored) : stored) : {};
    this.perms = {};
    for (const k of this.permKeys) this.perms[k] = parsed[k] ?? false;
    this.permsOpen.set(true);
  }

  savePerms() {
    const s = this.permsStaff();
    if (!s) return;
    this.api.patch(`/staff/${s.staff_id}/permissions`, { permissions: this.perms }).subscribe({
      next: () => { this.permsOpen.set(false); this.load(); },
      error: (err) => alert(err?.error?.message || 'Failed to save permissions.')
    });
  }
}
