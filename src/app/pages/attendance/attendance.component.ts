import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Member } from '../../core/models/models';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Attendance Monitor</h1>
      <p class="page-subtitle">Track physical library visits, log entries and exits, and analyze usage trends.</p>
    </div>
    <button class="btn btn-primary" (click)="logOpen.set(true)">+ Log Entry</button>
  </div>

  <!-- KPI row -->
  <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 20px;">
    <div class="card kpi-card">
      <span class="kpi-label">Total Visits</span>
      <span class="kpi-value">{{ totalVisits() }}</span>
    </div>
    <div class="card kpi-card">
      <span class="kpi-label">Active Now</span>
      <span class="kpi-value" style="color: var(--green-600);">{{ activeNow() }}</span>
      <span class="badge badge-green">In library</span>
    </div>
    <div class="card kpi-card">
      <span class="kpi-label">Peak Hour</span>
      <span class="kpi-value">{{ peakHour() }}</span>
    </div>
  </div>

  <div class="grid-2">
    <!-- Attendance log table -->
    <div class="card">
      <h3 style="font-size:.95rem; margin-bottom:14px;">Attendance Directory</h3>
      <table class="table">
        <thead><tr><th>Member</th><th>Entry</th><th>Exit</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let a of attendance()">
            <td>{{ a.full_name }}</td>
            <td>{{ a.entry_time | date:'MMM d, HH:mm' }}</td>
            <td>{{ a.exit_time ? (a.exit_time | date:'HH:mm') : '—' }}</td>
            <td>
              <span class="badge" [ngClass]="a.exit_time ? 'badge-gray' : 'badge-green'">
                {{ a.exit_time ? 'Completed' : 'Active' }}
              </span>
            </td>
            <td>
              <button class="btn btn-secondary btn-sm" *ngIf="!a.exit_time" (click)="logExit(a)">Log Exit</button>
            </td>
          </tr>
          <tr *ngIf="!attendance().length"><td colspan="5" class="empty">No attendance records.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Peak hours analytics -->
    <div class="card">
      <h3 style="font-size:.95rem; margin-bottom:14px;">Usage by Hour</h3>
      <div class="hour-chart">
        <div *ngFor="let h of hourData()" class="hour-row">
          <span class="hour-label">{{ h.hour }}:00</span>
          <div class="bar-track">
            <div class="bar-fill" [style.width.%]="hPct(h.visits)"></div>
          </div>
          <span class="hour-count">{{ h.visits }}</span>
        </div>
        <div *ngIf="!hourData().length" class="empty">No data yet.</div>
      </div>
      <p class="hint">Peak activity usually occurs between 2 PM and 4 PM.</p>
    </div>
  </div>

  <!-- Log Entry modal -->
  <div class="overlay" *ngIf="logOpen()" (click)="logOpen.set(false)">
    <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="logEntry()">
      <h3>Log Library Entry</h3>
      <label class="label">Member</label>
      <select class="input" name="member_id" [(ngModel)]="logForm.member_id" required>
        <option [ngValue]="null">— choose member —</option>
        <option *ngFor="let m of members()" [ngValue]="m.member_id">{{ m.full_name }} ({{ m.username }})</option>
      </select>
      <div *ngIf="logResult()" class="result-box">{{ logResult() }}</div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="logOpen.set(false)">Cancel</button>
        <button type="submit" class="btn btn-primary">Log Entry</button>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .grid-2 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 18px; align-items: start; }
    .empty { text-align: center; color: var(--slate-400); padding: 20px 0; }
    .hour-chart { display: flex; flex-direction: column; gap: 10px; max-height: 340px; overflow-y: auto; }
    .hour-row { display: grid; grid-template-columns: 48px 1fr 28px; align-items: center; gap: 10px; }
    .hour-label { font-size: 0.74rem; color: var(--slate-500); font-weight: 600; }
    .bar-track { height: 7px; border-radius: 5px; background: var(--slate-100); overflow: hidden; }
    .bar-fill { height: 100%; background: var(--blue-600); border-radius: 5px; transition: width .3s ease; }
    .hour-count { font-size: 0.74rem; font-weight: 700; color: var(--navy-900); text-align: right; }
    .hint { font-size: 0.74rem; color: var(--slate-500); margin-top: 14px; }
    .overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal { width: 380px; }
    .modal h3 { margin-bottom: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
    .result-box { background: var(--green-50); color: var(--green-600); font-size: 0.84rem; padding: 10px 14px; border-radius: 9px; margin-top: 14px; font-weight: 600; }
    @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
  `]
})
export class AttendanceComponent implements OnInit {
  attendance = signal<any[]>([]);
  members = signal<Member[]>([]);
  hourData = signal<{ hour: number; visits: number }[]>([]);
  totalVisits = signal(0);

  logOpen = signal(false);
  logForm: { member_id: number | null } = { member_id: null };
  logResult = signal('');

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.get<Member[]>('/members').subscribe(m => this.members.set(m));
    this.loadReport();
  }

  load() {
    this.api.get<any[]>('/services/attendance').subscribe(a => this.attendance.set(a));
  }

  loadReport() {
    this.api.get<any>('/services/attendance/report').subscribe(r => {
      this.totalVisits.set(r.total_visits || 0);
      this.hourData.set(r.by_hour || []);
    });
  }

  activeNow(): number {
    return this.attendance().filter(a => !a.exit_time).length;
  }

  peakHour(): string {
    const hours = this.hourData();
    if (!hours.length) return '—';
    const peak = hours.reduce((max, h) => h.visits > max.visits ? h : max, hours[0]);
    return `${peak.hour}:00`;
  }

  hPct(visits: number): number {
    const max = Math.max(...this.hourData().map(h => h.visits), 1);
    return Math.round((visits / max) * 100);
  }

  logEntry() {
    if (!this.logForm.member_id) return;
    this.api.post('/services/attendance', { member_id: this.logForm.member_id }).subscribe({
      next: () => {
        this.logResult.set('✓ Entry logged successfully.');
        this.logForm.member_id = null;
        this.load();
        this.loadReport();
      },
      error: (e) => this.logResult.set(e?.error?.message || 'Failed to log entry.')
    });
  }

  logExit(a: any) {
    this.api.patch(`/services/attendance/${a.attendance_id}/exit`, {}).subscribe(() => this.load());
  }
}
