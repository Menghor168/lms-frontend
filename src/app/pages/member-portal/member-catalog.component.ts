import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Book, Category } from '../../core/models/models';

@Component({
  selector: 'app-member-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="catalog-wrap">
    <!-- Sidebar filters -->
    <aside class="filters">
      <h3>Filters</h3>
      <div class="filter-section">
        <label class="f-label">Category</label>
        <div class="cat-filters">
          <button class="cat-filter-btn" [class.active]="!selectedCat" (click)="selectedCat=''; filter()">All</button>
          <button *ngFor="let c of categories()" class="cat-filter-btn" [class.active]="selectedCat===c.category_id+''" (click)="selectedCat=c.category_id+''; filter()">{{ c.category_name }}</button>
        </div>
      </div>
      <div class="filter-section">
        <label class="f-label">Availability</label>
        <div class="cat-filters">
          <button class="cat-filter-btn" [class.active]="avFilter===''" (click)="avFilter=''; filter()">All</button>
          <button class="cat-filter-btn" [class.active]="avFilter==='available'" (click)="avFilter='available'; filter()">Available</button>
          <button class="cat-filter-btn" [class.active]="avFilter==='borrowed'" (click)="avFilter='borrowed'; filter()">Borrowed</button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="catalog-main">
      <div class="search-bar">
        <div class="search-wrap">
          <svg class="s-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-inp" [(ngModel)]="search" (ngModelChange)="filter()" placeholder="Search by title, author, or ISBN..." />
        </div>
        <span class="result-count">{{ filtered().length }} books</span>
      </div>

      <div class="book-grid">
        <div class="book-card" *ngFor="let b of filtered()" (click)="select(b)">
          <div class="book-cover" [style.background]="grad(b.title)">
            <img *ngIf="b.cover_image" [src]="b.cover_image" style="width:100%;height:100%;object-fit:cover;" />
            <span *ngIf="!b.cover_image">{{ b.title.charAt(0) }}</span>
            <div class="avail-badge" [ngClass]="b.available_copies>0?'avail':'out'">{{ b.available_copies>0?'Available':'Borrowed' }}</div>
          </div>
          <div class="book-info">
            <div class="bk-cat">{{ b.category_name||'Book' }}</div>
            <h4 class="bk-title">{{ b.title }}</h4>
            <p class="bk-author">{{ b.author||'Unknown Author' }}</p>
            <div class="bk-copies">{{ b.available_copies }} / {{ b.total_copies }} available</div>
          </div>
        </div>
        <div class="empty-state" *ngIf="!filtered().length">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <p>No books found.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Detail modal -->
  <div class="overlay" *ngIf="selected()" (click)="selected.set(null)">
    <div class="detail-modal" (click)="$event.stopPropagation()">
      <div class="modal-cover" [style.background]="grad(selected()!.title)">
        <img *ngIf="selected()!.cover_image" [src]="selected()!.cover_image" style="width:100%;height:100%;object-fit:cover;border-radius:16px 16px 0 0;" />
        <span *ngIf="!selected()!.cover_image">{{ selected()!.title.charAt(0) }}</span>
        <button class="close-btn" (click)="selected.set(null)">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-top">
          <div>
            <div class="mdl-cat">{{ selected()!.category_name||'Book' }}</div>
            <h2 class="mdl-title">{{ selected()!.title }}</h2>
            <p class="mdl-author">by {{ selected()!.author||'Unknown Author' }}</p>
          </div>
          <span class="badge" [ngClass]="selected()!.available_copies>0?'badge-green':'badge-amber'">{{ selected()!.available_copies>0?'Available':'Borrowed' }}</span>
        </div>
        <div class="mdl-divider"></div>
        <div class="mdl-meta">
          <div class="meta-item"><span class="meta-l">ISBN</span><span class="meta-v">{{ selected()!.isbn||'—' }}</span></div>
          <div class="meta-item"><span class="meta-l">Price</span><span class="meta-v">\${{ selected()!.price||0 }}</span></div>
          <div class="meta-item"><span class="meta-l">Copies</span><span class="meta-v">{{ selected()!.available_copies }} of {{ selected()!.total_copies }}</span></div>
        </div>
        <p class="mdl-desc" *ngIf="selected()!.description">{{ selected()!.description }}</p>
        <div *ngIf="msg()" class="result-box" [class.error-box]="msgErr()">{{ msg() }}</div>
        <div class="mdl-foot">
          <button class="btn btn-secondary" (click)="selected.set(null)">Close</button>
          <button class="btn btn-primary" *ngIf="selected()!.available_copies>0" (click)="reserve(selected()!)" [disabled]="reserving()">
            {{ reserving()?'Reserving...':'Reserve this Book' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .catalog-wrap { display:flex; min-height:calc(100vh - 61px); }

    /* Filters */
    .filters { width:220px; flex-shrink:0; background:var(--white); border-right:1px solid var(--slate-200); padding:24px 16px; position:sticky; top:61px; height:calc(100vh - 61px); overflow-y:auto; }
    .filters h3 { font-size:0.9rem; font-weight:700; color:var(--slate-900); margin-bottom:20px; }
    .filter-section { margin-bottom:20px; }
    .f-label { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--slate-500); display:block; margin-bottom:8px; }
    .cat-filters { display:flex; flex-direction:column; gap:4px; }
    .cat-filter-btn { padding:7px 12px; border-radius:var(--radius-md); text-align:left; font-size:0.82rem; color:var(--slate-600); transition:all .15s; cursor:pointer; border:none; background:none; }
    .cat-filter-btn:hover { background:var(--blue-50); color:var(--blue-700); }
    .cat-filter-btn.active { background:var(--blue-600); color:#fff; font-weight:600; }

    /* Main */
    .catalog-main { flex:1; padding:24px 28px; }
    .search-bar { display:flex; align-items:center; gap:16px; margin-bottom:22px; }
    .search-wrap { position:relative; flex:1; max-width:500px; }
    .s-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--slate-400); pointer-events:none; }
    .search-inp { width:100%; padding:10px 12px 10px 36px; border:1.5px solid var(--slate-200); border-radius:var(--radius-md); font-size:0.86rem; outline:none; transition:border-color .15s; }
    .search-inp:focus { border-color:var(--blue-500); box-shadow:0 0 0 3px rgba(59,130,246,.1); }
    .result-count { font-size:0.82rem; color:var(--slate-500); font-weight:500; white-space:nowrap; }

    .book-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:18px; }
    .book-card { background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); overflow:hidden; cursor:pointer; transition:all .2s; }
    .book-card:hover { box-shadow:var(--shadow-md); transform:translateY(-4px); border-color:var(--blue-200); }
    .book-cover { height:220px; display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:900; color:rgba(255,255,255,.9); position:relative; overflow:hidden; }
    .avail-badge { position:absolute; bottom:8px; left:8px; font-size:0.66rem; font-weight:700; padding:3px 9px; border-radius:999px; }
    .avail-badge.avail { background:rgba(34,197,94,.9); color:#fff; }
    .avail-badge.out   { background:rgba(245,158,11,.9); color:#fff; }
    .book-info { padding:12px 14px 16px; }
    .bk-cat    { font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--blue-600); margin-bottom:4px; }
    .bk-title  { font-size:0.88rem; font-weight:700; color:var(--slate-900); margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bk-author { font-size:0.74rem; color:var(--slate-500); margin-bottom:6px; }
    .bk-copies { font-size:0.72rem; color:var(--slate-400); }

    .empty-state { grid-column:1/-1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:60px; color:var(--slate-300); }
    .empty-state p { color:var(--slate-500); font-size:0.88rem; }

    /* Modal */
    .overlay { position:fixed; inset:0; background:rgba(15,23,42,.6); display:flex; align-items:center; justify-content:center; z-index:100; backdrop-filter:blur(6px); }
    .detail-modal { background:var(--white); border-radius:16px; width:520px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(15,23,42,.3); }
    .modal-cover { height:220px; display:flex; align-items:center; justify-content:center; font-size:4rem; font-weight:900; color:rgba(255,255,255,.9); position:relative; overflow:hidden; border-radius:16px 16px 0 0; }
    .close-btn { position:absolute; top:12px; right:12px; width:30px; height:30px; border-radius:50%; background:rgba(15,23,42,.5); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; cursor:pointer; border:none; transition:.15s; }
    .close-btn:hover { background:rgba(15,23,42,.8); }
    .modal-body { padding:22px 24px; }
    .modal-top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:16px; }
    .mdl-cat   { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--blue-600); margin-bottom:5px; }
    .mdl-title { font-size:1.3rem; font-weight:800; color:var(--slate-900); margin-bottom:4px; letter-spacing:-0.02em; }
    .mdl-author{ font-size:0.84rem; color:var(--slate-500); }
    .mdl-divider { height:1px; background:var(--slate-100); margin:16px 0; }
    .mdl-meta  { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
    .meta-item { display:flex; flex-direction:column; gap:3px; }
    .meta-l    { font-size:0.68rem; font-weight:600; text-transform:uppercase; color:var(--slate-400); letter-spacing:0.04em; }
    .meta-v    { font-size:0.88rem; font-weight:600; color:var(--slate-800); }
    .mdl-desc  { font-size:0.84rem; color:var(--slate-600); line-height:1.6; background:var(--slate-50); padding:12px 14px; border-radius:var(--radius-md); margin-bottom:14px; }
    .mdl-foot  { display:flex; justify-content:flex-end; gap:10px; margin-top:16px; }
    .result-box{ background:var(--green-50); color:#15803D; font-size:0.82rem; padding:10px 14px; border-radius:var(--radius-md); margin-bottom:12px; border:1px solid #BBF7D0; }
    .error-box { background:var(--red-50); color:#DC2626; border-color:#FECACA; }

    @media(max-width:768px){ .catalog-wrap{flex-direction:column;} .filters{width:100%;height:auto;position:static;border-right:none;border-bottom:1px solid var(--slate-200);} .cat-filters{flex-direction:row;flex-wrap:wrap;} .catalog-main{padding:16px;} }
  `]
})
export class MemberCatalogComponent implements OnInit {
  books=signal<Book[]>([]); categories=signal<Category[]>([]); filtered=signal<Book[]>([]);
  selected=signal<Book|null>(null); search=''; selectedCat=''; avFilter='';
  reserving=signal(false); msg=signal(''); msgErr=signal(false);

  constructor(private api: ApiService, public auth: AuthService){}
  ngOnInit(){
    this.api.get<Category[]>('/categories').subscribe(c=>this.categories.set(c));
    this.api.get<Book[]>('/books').subscribe(b=>{this.books.set(b);this.filtered.set(b);});
  }
  filter(){
    let r=this.books();
    if(this.search) r=r.filter(b=>b.title.toLowerCase().includes(this.search.toLowerCase())||(b.author||'').toLowerCase().includes(this.search.toLowerCase()));
    if(this.selectedCat) r=r.filter(b=>b.category_id==+this.selectedCat);
    if(this.avFilter==='available') r=r.filter(b=>b.available_copies>0);
    if(this.avFilter==='borrowed')  r=r.filter(b=>b.available_copies===0);
    this.filtered.set(r);
  }
  select(b:Book){ this.selected.set(b); this.msg.set(''); this.msgErr.set(false); }
  reserve(b:Book){
    const mid=this.auth.currentUser()?.member_id; if(!mid) return;
    this.reserving.set(true);
    this.api.post('/services/reservations',{book_id:b.book_id,member_id:mid}).subscribe({
      next:()=>{this.reserving.set(false);this.msgErr.set(false);this.msg.set('✓ Book reserved! Visit the library to collect it.');},
      error:(e)=>{this.reserving.set(false);this.msgErr.set(true);this.msg.set(e?.error?.message||'Reservation failed.');}
    });
  }
  grad(title:string){ const h=title.charCodeAt(0)%360; return `linear-gradient(135deg,hsl(${h},60%,25%),hsl(${(h+40)%360},70%,45%))`; }
}
