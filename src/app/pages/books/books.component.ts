import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Book, Category } from '../../core/models/models';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Book Management</h1>
      <p class="page-subtitle">{{ books().length }} books in the catalogue</p>
    </div>
    <div class="hdr-actions">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" [(ngModel)]="search" (ngModelChange)="load()" placeholder="Search title, author, ISBN..." />
      </div>
      <select class="input" style="width:160px;" [(ngModel)]="filterCat" (ngModelChange)="load()">
        <option value="">All categories</option>
        <option *ngFor="let c of categories()" [value]="c.category_id">{{ c.category_name }}</option>
      </select>
      <button class="btn btn-primary" *ngIf="auth.isStaffOrAdmin()" (click)="openForm()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Book
      </button>
    </div>
  </div>

  <!-- View toggle -->
  <div class="view-toggle">
    <button [class.active]="view()==='grid'" (click)="view.set('grid')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Grid
    </button>
    <button [class.active]="view()==='list'" (click)="view.set('list')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> List
    </button>
  </div>

  <!-- Grid view -->
  <div class="book-grid" *ngIf="view()==='grid'">
    <div class="book-card" *ngFor="let b of books()">
      <div class="book-cover" [class.has-image]="b.cover_image">
        <img *ngIf="b.cover_image" [src]="b.cover_image" [alt]="b.title" />
        <div *ngIf="!b.cover_image" class="cover-initial">{{ b.title.charAt(0) }}</div>
        <div class="cover-overlay">
          <span class="avail-pill" [ngClass]="b.available_copies > 0 ? 'avail' : 'out'">
            {{ b.available_copies > 0 ? 'Available' : 'Borrowed' }}
          </span>
        </div>
      </div>
      <div class="book-body">
        <div class="book-cat">{{ b.category_name || 'Uncategorized' }}</div>
        <h4 class="book-title">{{ b.title }}</h4>
        <p class="book-author">{{ b.author || 'Unknown Author' }}</p>
        <div class="book-footer">
          <span class="copies-txt">{{ b.available_copies }}/{{ b.total_copies }} copies</span>
          <div class="card-actions" *ngIf="auth.isStaffOrAdmin()">
            <button class="icon-btn" title="Edit" (click)="openForm(b)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn danger" title="Delete" (click)="remove(b)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="empty" style="grid-column:1/-1" *ngIf="!books().length">No books found.</div>
  </div>

  <!-- List view -->
  <div class="card" *ngIf="view()==='list'">
    <table class="table">
      <thead><tr><th>Cover</th><th>Title</th><th>Author</th><th>Category</th><th>Copies</th><th>Status</th><th *ngIf="auth.isStaffOrAdmin()"></th></tr></thead>
      <tbody>
        <tr *ngFor="let b of books()">
          <td>
            <div class="list-cover">
              <img *ngIf="b.cover_image" [src]="b.cover_image" [alt]="b.title" />
              <div *ngIf="!b.cover_image" class="list-initial">{{ b.title.charAt(0) }}</div>
            </div>
          </td>
          <td><strong>{{ b.title }}</strong></td>
          <td>{{ b.author || '—' }}</td>
          <td>{{ b.category_name || '—' }}</td>
          <td>{{ b.available_copies }}/{{ b.total_copies }}</td>
          <td><span class="badge" [ngClass]="b.available_copies > 0 ? 'badge-green' : 'badge-amber'">{{ b.available_copies > 0 ? 'Available' : 'Borrowed' }}</span></td>
          <td *ngIf="auth.isStaffOrAdmin()">
            <div style="display:flex;gap:6px;">
              <button class="btn btn-secondary btn-sm" (click)="openForm(b)">Edit</button>
              <button class="btn btn-danger btn-sm" (click)="remove(b)">Delete</button>
            </div>
          </td>
        </tr>
        <tr *ngIf="!books().length"><td colspan="7" class="empty">No books found.</td></tr>
      </tbody>
    </table>
  </div>

  <!-- Add/Edit Modal -->
  <div class="overlay" *ngIf="formOpen()" (click)="closeForm()">
    <form class="card modal" (click)="$event.stopPropagation()" (ngSubmit)="save()">
      <h3>{{ editing() ? 'Edit Book' : 'Add New Book' }}</h3>

      <!-- Cover image upload -->
      <div class="cover-upload-area">
        <div class="cover-preview" *ngIf="form.cover_image">
          <img [src]="form.cover_image" alt="cover" />
          <button type="button" class="remove-img" (click)="form.cover_image = ''">✕</button>
        </div>
        <div class="upload-placeholder" *ngIf="!form.cover_image">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Upload cover image</span>
          <span class="upload-sub">JPG, PNG, WEBP · Max 2MB</span>
        </div>
        <input type="file" accept="image/*" class="file-input" (change)="onImage($event)" />
      </div>

      <label class="label">Title *</label>
      <input class="input" name="title" [(ngModel)]="form.title" placeholder="Book title" required style="margin-bottom:12px;" />

      <div class="row2">
        <div><label class="label">Author</label><input class="input" name="author" [(ngModel)]="form.author" placeholder="Author name" /></div>
        <div><label class="label">ISBN</label><input class="input" name="isbn" [(ngModel)]="form.isbn" placeholder="ISBN" /></div>
      </div>
      <div class="row2">
        <div><label class="label">Price ($)</label><input class="input" type="number" name="price" [(ngModel)]="form.price" /></div>
        <div><label class="label">Total Copies</label><input class="input" type="number" name="total_copies" [(ngModel)]="form.total_copies" /></div>
      </div>
      <label class="label">Category</label>
      <select class="input" name="category_id" [(ngModel)]="form.category_id" style="margin-bottom:12px;">
        <option [ngValue]="null">Uncategorized</option>
        <option *ngFor="let c of categories()" [ngValue]="c.category_id">{{ c.category_name }}</option>
      </select>
      <label class="label">Description</label>
      <textarea class="input" rows="2" name="description" [(ngModel)]="form.description" placeholder="Short description..." style="resize:vertical;"></textarea>

      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" (click)="closeForm()">Cancel</button>
        <button type="submit" class="btn btn-primary">{{ editing() ? 'Save Changes' : 'Add Book' }}</button>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .hdr-actions { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
    .search-wrap { position:relative; }
    .search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--slate-400); }
    .search-input { padding:9px 12px 9px 32px; border:1.5px solid var(--slate-200); border-radius:var(--radius-md); font-size:0.84rem; outline:none; width:240px; transition:border-color .15s; }
    .search-input:focus { border-color:var(--blue-500); }

    .view-toggle { display:flex; gap:0; margin-bottom:18px; border:1px solid var(--slate-200); border-radius:var(--radius-md); overflow:hidden; width:fit-content; background:var(--white); }
    .view-toggle button { display:flex; align-items:center; gap:6px; padding:7px 14px; font-size:0.78rem; font-weight:600; color:var(--slate-500); transition:all .15s; border-right:1px solid var(--slate-200); cursor:pointer; background:none; border-top:none; border-bottom:none; border-left:none; border-right:1px solid var(--slate-200); }
    .view-toggle button:last-child { border-right:none; }
    .view-toggle button.active { background:var(--blue-600); color:#fff; }

    /* Grid */
    .book-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(185px,1fr)); gap:18px; }
    .book-card { background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); overflow:hidden; transition:all .2s ease; cursor:default; }
    .book-card:hover { box-shadow:var(--shadow-md); transform:translateY(-3px); border-color:var(--blue-200); }

    .book-cover { height:200px; background:linear-gradient(135deg,var(--blue-800),var(--blue-600)); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
    .book-cover.has-image { background:#f1f5f9; }
    .book-cover img { width:100%; height:100%; object-fit:cover; }
    .cover-initial { font-size:3rem; font-weight:800; color:rgba(255,255,255,0.9); }
    .cover-overlay { position:absolute; bottom:8px; left:8px; }
    .avail-pill { font-size:0.66rem; font-weight:700; padding:3px 8px; border-radius:999px; text-transform:uppercase; letter-spacing:0.04em; }
    .avail-pill.avail { background:rgba(34,197,94,0.9); color:#fff; }
    .avail-pill.out   { background:rgba(245,158,11,0.9); color:#fff; }

    .book-body { padding:12px 14px 14px; }
    .book-cat  { font-size:0.66rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--blue-600); margin-bottom:4px; }
    .book-title{ font-size:0.88rem; font-weight:700; color:var(--slate-900); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .book-author{ font-size:0.74rem; color:var(--slate-500); margin-bottom:8px; }
    .book-footer{ display:flex; align-items:center; justify-content:space-between; }
    .copies-txt { font-size:0.72rem; color:var(--slate-400); }
    .card-actions { display:flex; gap:4px; }
    .icon-btn { width:26px; height:26px; border-radius:6px; display:flex; align-items:center; justify-content:center; color:var(--slate-500); transition:all .15s; cursor:pointer; background:var(--slate-100); border:none; }
    .icon-btn:hover { background:var(--blue-50); color:var(--blue-600); }
    .icon-btn.danger:hover { background:var(--red-50); color:var(--red-500); }

    /* List cover */
    .list-cover { width:36px; height:50px; border-radius:4px; overflow:hidden; background:linear-gradient(135deg,var(--blue-700),var(--blue-500)); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .list-cover img { width:100%; height:100%; object-fit:cover; }
    .list-initial { font-size:1rem; font-weight:800; color:rgba(255,255,255,0.9); }

    /* Modal */
    .modal { width:500px; }
    .cover-upload-area { position:relative; border:2px dashed var(--slate-200); border-radius:var(--radius-lg); overflow:hidden; margin-bottom:16px; cursor:pointer; transition:border-color .15s; min-height:120px; display:flex; align-items:center; justify-content:center; }
    .cover-upload-area:hover { border-color:var(--blue-400); }
    .cover-preview { width:100%; position:relative; }
    .cover-preview img { width:100%; max-height:200px; object-fit:cover; display:block; }
    .remove-img { position:absolute; top:8px; right:8px; width:26px; height:26px; border-radius:50%; background:rgba(15,23,42,0.6); color:#fff; font-size:0.75rem; display:flex; align-items:center; justify-content:center; cursor:pointer; border:none; }
    .upload-placeholder { display:flex; flex-direction:column; align-items:center; gap:6px; padding:24px; color:var(--slate-400); text-align:center; }
    .upload-placeholder span { font-size:0.82rem; font-weight:600; }
    .upload-sub { font-size:0.72rem; font-weight:400 !important; color:var(--slate-300); }
    .file-input { position:absolute; inset:0; opacity:0; cursor:pointer; }
  `]
})
export class BooksComponent implements OnInit {
  books      = signal<Book[]>([]);
  categories = signal<Category[]>([]);
  search = ''; filterCat = '';
  view   = signal<'grid'|'list'>('grid');
  formOpen = signal(false);
  editing  = signal<Book | null>(null);
  form: any = {};

  constructor(private api: ApiService, public auth: AuthService){}
  ngOnInit(){ this.load(); this.api.get<Category[]>('/categories').subscribe(c => this.categories.set(c)); }

  load(){
    const params: any = {};
    if(this.search) params['search'] = this.search;
    if(this.filterCat) params['category_id'] = this.filterCat;
    this.api.get<Book[]>('/books', params).subscribe(b => this.books.set(b));
  }

  onImage(event: Event){
    const file = (event.target as HTMLInputElement).files?.[0];
    if(!file) return;
    if(file.size > 2 * 1024 * 1024){ alert('Image must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { this.form.cover_image = reader.result as string; };
    reader.readAsDataURL(file);
  }

  openForm(book?: Book){
    this.editing.set(book || null);
    this.form = book ? { ...book } : { title:'', author:'', isbn:'', price:0, total_copies:1, category_id:null, description:'', cover_image:'' };
    this.formOpen.set(true);
  }
  closeForm(){ this.formOpen.set(false); }

  save(){
    const e = this.editing();
    const req = e ? this.api.put(`/books/${e.book_id}`, this.form) : this.api.post('/books', this.form);
    req.subscribe({ next:()=>{ this.closeForm(); this.load(); }, error:(err)=>alert(err?.error?.message||'Failed to save.') });
  }

  remove(b: Book){
    if(!confirm(`Delete "${b.title}"?`)) return;
    this.api.delete(`/books/${b.book_id}`).subscribe(()=>this.load());
  }
}
