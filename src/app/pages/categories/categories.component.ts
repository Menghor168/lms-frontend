import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Category Management</h1>
      <p class="page-subtitle">Organize the catalog into logical groups for faster searching.</p>
    </div>
  </div>

  <div class="layout">
    <form class="card form-card" (ngSubmit)="add()">
      <h3>Add Category</h3>
      <label class="label">Category name</label>
      <input class="input" name="category_name" [(ngModel)]="newName" placeholder="e.g. Science Fiction" required />
      <button class="btn btn-primary" style="margin-top:14px; width:100%; justify-content:center;">+ Create</button>
    </form>

    <div class="card">
      <table class="table">
        <thead><tr><th>Category</th><th>Books</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let c of categories()">
            <td>
              <input *ngIf="editingId() === c.category_id" class="input" [(ngModel)]="editName" name="editName" />
              <span *ngIf="editingId() !== c.category_id">{{ c.category_name }}</span>
            </td>
            <td><span class="badge badge-blue">{{ c.book_count || 0 }}</span></td>
            <td class="row-actions">
              <ng-container *ngIf="editingId() === c.category_id">
                <button class="btn btn-primary btn-sm" (click)="saveEdit(c)">Save</button>
                <button class="btn btn-secondary btn-sm" (click)="editingId.set(null)">Cancel</button>
              </ng-container>
              <ng-container *ngIf="editingId() !== c.category_id">
                <button class="btn btn-secondary btn-sm" (click)="startEdit(c)">Edit</button>
                <button class="btn btn-danger btn-sm" (click)="remove(c)">Delete</button>
              </ng-container>
            </td>
          </tr>
          <tr *ngIf="!categories().length"><td colspan="3" class="empty">No categories yet.</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 280px 1fr; gap: 18px; align-items: start; }
    .form-card h3 { margin-bottom: 14px; font-size: 0.95rem; }
    .row-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .empty { text-align: center; color: var(--slate-400); padding: 20px 0; }
    @media (max-width: 800px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class CategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  newName = '';
  editingId = signal<number | null>(null);
  editName = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Category[]>('/categories').subscribe(c => this.categories.set(c));
  }

  add() {
    if (!this.newName.trim()) return;
    this.api.post('/categories', { category_name: this.newName }).subscribe(() => {
      this.newName = '';
      this.load();
    });
  }

  startEdit(c: Category) {
    this.editingId.set(c.category_id);
    this.editName = c.category_name;
  }

  saveEdit(c: Category) {
    this.api.put(`/categories/${c.category_id}`, { category_name: this.editName }).subscribe(() => {
      this.editingId.set(null);
      this.load();
    });
  }

  remove(c: Category) {
    if (!confirm(`Delete category "${c.category_name}"?`)) return;
    this.api.delete(`/categories/${c.category_id}`).subscribe(() => this.load());
  }
}
