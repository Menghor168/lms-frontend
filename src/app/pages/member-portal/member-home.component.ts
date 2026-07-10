import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Book, Category } from '../../core/models/models';

@Component({
  selector: 'app-member-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <!-- Hero -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-badge">Welcome back, {{ (auth.currentUser()?.full_name || '').split(' ')[0] }} 👋</div>
      <h1>Discover Your<br/>Next Great Read</h1>
      <p>Browse thousands of books, reserve your picks, and manage your reading journey — all in one place.</p>
      <div class="hero-btns">
        <a routerLink="/member/catalog" class="btn-hero-primary">Browse Catalogue</a>
        <a routerLink="/member/reservations" class="btn-hero-secondary">My Books</a>
      </div>
    </div>
    <div class="hero-books">
      <div class="floating-books">
        <div *ngFor="let b of featured().slice(0,4); let i=index" class="float-book" [style.transform]="'rotate('+(i%2===0?'-':'')+'4deg) translateY('+(i*8)+'px)'">
          <div class="fb-cover" [style.background]="coverGrad(b.title)">
            <img *ngIf="b.cover_image" [src]="b.cover_image" style="width:100%;height:100%;object-fit:cover;" />
            <span *ngIf="!b.cover_image">{{ b.title.charAt(0) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats bar -->
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-num">{{ totalAvail() }}</span>
      <span class="stat-lbl">Books Available</span>
    </div>
    <div class="stat-div"></div>
    <div class="stat-item">
      <span class="stat-num">{{ categories().length }}</span>
      <span class="stat-lbl">Categories</span>
    </div>
    <div class="stat-div"></div>
    <div class="stat-item">
      <span class="stat-num">Free</span>
      <span class="stat-lbl">Reservations</span>
    </div>
    <div class="stat-div"></div>
    <div class="stat-item">
      <span class="stat-num">24/7</span>
      <span class="stat-lbl">Online Access</span>
    </div>
  </div>

  <!-- Categories -->
  <section class="section">
    <div class="section-header">
      <h2>Browse by Category</h2>
      <a routerLink="/member/catalog" class="see-all">See all books →</a>
    </div>
    <div class="cat-grid">
      <a routerLink="/member/catalog" *ngFor="let c of categories(); let i=index" class="cat-card">
        <div class="cat-icon" [style.background]="catColor(i)+'18'" [style.color]="catColor(i)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div class="cat-name">{{ c.category_name }}</div>
        <div class="cat-count">{{ c.book_count || 0 }} books</div>
        <div class="cat-arrow">→</div>
      </a>
    </div>
  </section>

  <!-- Featured books -->
  <section class="section section-alt">
    <div class="section-inner">
      <div class="section-header">
        <h2>Featured Books</h2>
        <a routerLink="/member/catalog" class="see-all">View all →</a>
      </div>
      <div class="featured-grid">
        <a routerLink="/member/catalog" *ngFor="let b of featured()" class="feat-card">
          <div class="feat-cover" [style.background]="coverGrad(b.title)">
            <img *ngIf="b.cover_image" [src]="b.cover_image" style="width:100%;height:100%;object-fit:cover;border-radius:10px 10px 0 0;" />
            <span *ngIf="!b.cover_image">{{ b.title.charAt(0) }}</span>
            <div class="avail-tag" [ngClass]="b.available_copies > 0 ? 'avail' : 'out'">{{ b.available_copies > 0 ? 'Available' : 'Borrowed' }}</div>
          </div>
          <div class="feat-body">
            <div class="feat-cat">{{ b.category_name || 'Book' }}</div>
            <h4 class="feat-title">{{ b.title }}</h4>
            <p class="feat-author">{{ b.author || 'Unknown Author' }}</p>
          </div>
        </a>
      </div>
    </div>
  </section>
  `,
  styles: [`
    /* Hero */
    .hero {
      background:linear-gradient(135deg, var(--blue-950) 0%, var(--blue-800) 60%, var(--blue-600) 100%);
      padding:64px 60px; display:flex; align-items:center; justify-content:space-between; gap:40px; min-height:420px; overflow:hidden; position:relative;
    }
    .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 20% 50%, rgba(99,102,241,.2) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%, rgba(6,182,212,.15) 0%,transparent 60%); }
    .hero-content { position:relative; max-width:520px; }
    .hero-badge { display:inline-block; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.9); font-size:0.82rem; font-weight:600; padding:6px 14px; border-radius:999px; margin-bottom:18px; backdrop-filter:blur(8px); }
    .hero h1 { font-size:2.6rem; font-weight:900; color:#fff; line-height:1.1; margin-bottom:16px; letter-spacing:-0.04em; }
    .hero p  { color:rgba(255,255,255,.7); font-size:0.95rem; line-height:1.65; margin-bottom:28px; max-width:420px; }
    .hero-btns { display:flex; gap:12px; }
    .btn-hero-primary { padding:12px 24px; background:#fff; color:var(--blue-700); border-radius:var(--radius-md); font-weight:700; font-size:0.88rem; transition:all .15s; box-shadow:0 4px 14px rgba(0,0,0,.2); }
    .btn-hero-primary:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.25); }
    .btn-hero-secondary { padding:12px 24px; border:1.5px solid rgba(255,255,255,.3); color:#fff; border-radius:var(--radius-md); font-weight:600; font-size:0.88rem; transition:all .15s; backdrop-filter:blur(8px); }
    .btn-hero-secondary:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.5); }

    .hero-books { position:relative; flex-shrink:0; }
    .floating-books { display:flex; gap:12px; align-items:center; }
    .float-book { transition:transform .3s ease; }
    .float-book:hover { transform:scale(1.05) !important; }
    .fb-cover { width:110px; height:160px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:2.5rem; font-weight:900; color:rgba(255,255,255,.9); box-shadow:0 8px 24px rgba(0,0,0,.3); overflow:hidden; }

    /* Stats */
    .stats-bar { background:var(--white); border-bottom:1px solid var(--slate-200); display:flex; align-items:center; justify-content:center; gap:0; }
    .stat-item { display:flex; flex-direction:column; align-items:center; gap:3px; padding:18px 48px; }
    .stat-num { font-size:1.4rem; font-weight:800; color:var(--slate-900); letter-spacing:-0.03em; }
    .stat-lbl { font-size:0.72rem; font-weight:600; color:var(--slate-500); text-transform:uppercase; letter-spacing:0.05em; }
    .stat-div { width:1px; height:40px; background:var(--slate-200); }

    /* Section */
    .section { padding:48px 60px; }
    .section-alt { background:var(--slate-50); }
    .section-inner { max-width:1280px; margin:0 auto; }
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .section-header h2 { font-size:1.4rem; font-weight:800; color:var(--slate-900); letter-spacing:-0.02em; }
    .see-all { font-size:0.84rem; color:var(--blue-600); font-weight:600; }
    .see-all:hover { color:var(--blue-700); }

    /* Categories */
    .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
    .cat-card { background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:18px 16px; transition:all .2s; cursor:pointer; display:flex; flex-direction:column; gap:6px; }
    .cat-card:hover { border-color:var(--blue-300); box-shadow:var(--shadow-md); transform:translateY(-2px); }
    .cat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
    .cat-name { font-weight:700; font-size:0.88rem; color:var(--slate-900); }
    .cat-count { font-size:0.74rem; color:var(--slate-500); }
    .cat-arrow { font-size:0.8rem; color:var(--slate-400); margin-top:4px; }
    .cat-card:hover .cat-arrow { color:var(--blue-600); }

    /* Featured */
    .featured-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:16px; }
    .feat-card { background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); overflow:hidden; transition:all .2s; cursor:pointer; display:block; }
    .feat-card:hover { box-shadow:var(--shadow-md); transform:translateY(-4px); border-color:var(--blue-200); }
    .feat-cover { height:220px; display:flex; align-items:center; justify-content:center; font-size:3rem; font-weight:900; color:rgba(255,255,255,.9); position:relative; overflow:hidden; }
    .avail-tag { position:absolute; bottom:8px; left:8px; font-size:0.66rem; font-weight:700; padding:3px 9px; border-radius:999px; }
    .avail-tag.avail { background:rgba(34,197,94,.9); color:#fff; }
    .avail-tag.out   { background:rgba(245,158,11,.9); color:#fff; }
    .feat-body { padding:12px 14px 16px; }
    .feat-cat  { font-size:0.66rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--blue-600); margin-bottom:4px; }
    .feat-title{ font-size:0.9rem; font-weight:700; color:var(--slate-900); margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .feat-author{ font-size:0.76rem; color:var(--slate-500); }

    @media(max-width:900px){ .hero{padding:40px 24px;flex-direction:column;} .hero-books{display:none;} .section{padding:32px 20px;} .stat-item{padding:14px 20px;} }
  `]
})
export class MemberHomeComponent implements OnInit {
  categories = signal<Category[]>([]);
  featured   = signal<Book[]>([]);
  totalAvail = signal(0);
  colors = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899'];

  constructor(private api: ApiService, public auth: AuthService){}
  ngOnInit(){
    this.api.get<Category[]>('/categories').subscribe(c => this.categories.set(c));
    this.api.get<Book[]>('/books').subscribe(b => { this.totalAvail.set(b.filter(x=>x.available_copies>0).length); this.featured.set(b.slice(0,8)); });
  }
  coverGrad(title:string){ const h=title.charCodeAt(0)%360; return `linear-gradient(135deg,hsl(${h},60%,25%),hsl(${(h+40)%360},70%,45%))`; }
  catColor(i:number){ return this.colors[i%this.colors.length]; }
}
