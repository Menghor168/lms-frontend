import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="page-header">
    <div>
      <h1 class="page-title">Reports & Analytics</h1>
      <p class="page-subtitle">Generate, preview and export library reports to Excel or PDF.</p>
    </div>
  </div>

  <!-- Report Cards -->
  <div class="report-grid">
    <div class="report-card" *ngFor="let r of reportTypes">
      <div class="rc-icon">{{ r.icon }}</div>
      <div class="rc-body">
        <h3>{{ r.label }}</h3>
        <p>{{ r.desc }}</p>
      </div>
      <div class="rc-actions">
        <button class="btn btn-gold btn-sm" (click)="preview(r.type)">Preview</button>
        <button class="btn btn-secondary btn-sm" (click)="download(r.type,'excel')">⬇ Excel</button>
        <button class="btn btn-primary btn-sm"  (click)="download(r.type,'pdf')">⬇ PDF</button>
      </div>
    </div>
  </div>

  <!-- Date range for transaction report -->
  <div class="card filter-card">
    <h3 class="filter-title">Transaction Report Date Range</h3>
    <div class="gold-strip"></div>
    <div class="filter-row">
      <div>
        <label class="label">From Date</label>
        <input class="input" type="date" [(ngModel)]="fromDate" />
      </div>
      <div>
        <label class="label">To Date</label>
        <input class="input" type="date" [(ngModel)]="toDate" />
      </div>
      <div class="filter-btns">
        <button class="btn btn-gold" (click)="preview('transactions')">Preview</button>
        <button class="btn btn-secondary" (click)="download('transactions','excel')">⬇ Excel</button>
        <button class="btn btn-primary"  (click)="download('transactions','pdf')">⬇ PDF</button>
      </div>
    </div>
  </div>

  <!-- Preview Table -->
  <div class="card preview-card" *ngIf="previewData().length || previewLoading()">
    <div class="preview-header">
      <h3>{{ previewTitle() }}</h3>
      <div class="preview-actions">
        <button class="btn btn-secondary btn-sm" (click)="download(currentType(),'excel')">⬇ Excel</button>
        <button class="btn btn-primary btn-sm"  (click)="download(currentType(),'pdf')">⬇ PDF</button>
        <button class="btn btn-secondary btn-sm" (click)="previewData.set([])">✕ Close</button>
      </div>
    </div>
    <div class="gold-strip"></div>
    <div *ngIf="previewLoading()" class="loading">Loading preview...</div>
    <div class="preview-scroll" *ngIf="!previewLoading() && previewData().length">
      <table class="table">
        <thead>
          <tr><th *ngFor="let col of previewCols()">{{ col }}</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of previewData()">
            <td *ngFor="let col of previewCols()">{{ row[colKey(col)] ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="row-count">Showing {{ previewData().length }} record(s)</p>
    </div>
    <div class="empty" *ngIf="!previewLoading() && !previewData().length">No data for this report.</div>
  </div>
  `,
  styles: [`
    .report-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:22px;}
    .report-card{background:#fff;border:1px solid var(--parchment-dk);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;box-shadow:0 2px 10px rgba(18,8,10,0.06);}
    .report-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--garnet),var(--gold));}
    .rc-icon{font-size:2rem;color:var(--gold);}
    .rc-body h3{font-family:'Cinzel',serif;color:var(--garnet);font-size:0.95rem;margin-bottom:4px;}
    .rc-body p{font-size:0.78rem;color:var(--stone);line-height:1.5;}
    .rc-actions{display:flex;gap:8px;flex-wrap:wrap;}
    .btn-gold{background:linear-gradient(135deg,#8B6A10,#C8940A);color:#fff;border:none;cursor:pointer;font-family:inherit;}
    .btn-gold:hover{background:linear-gradient(135deg,#C8940A,#E8B420);}
    .filter-card{margin-bottom:22px;}
    .filter-title{font-family:'Cinzel',serif;color:var(--garnet);font-size:1rem;margin-bottom:10px;}
    .gold-strip{height:2px;background:linear-gradient(90deg,var(--garnet),var(--gold),transparent);border-radius:2px;margin-bottom:16px;}
    .filter-row{display:grid;grid-template-columns:1fr 1fr auto;gap:14px;align-items:flex-end;}
    .filter-btns{display:flex;gap:8px;flex-wrap:wrap;padding-bottom:2px;}
    .preview-card{margin-top:0;}
    .preview-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:10px;}
    .preview-header h3{font-family:'Cinzel',serif;color:var(--garnet);font-size:1rem;}
    .preview-actions{display:flex;gap:8px;flex-wrap:wrap;}
    .preview-scroll{overflow-x:auto;}
    .row-count{font-size:0.74rem;color:var(--stone);margin-top:10px;font-style:italic;}
    .loading{text-align:center;color:var(--stone);padding:24px;font-style:italic;}
    .empty{text-align:center;color:var(--stone-light);padding:24px;}
    @media(max-width:700px){.filter-row{grid-template-columns:1fr;}}
  `]
})
export class ReportsComponent implements OnInit {
  fromDate = '';
  toDate   = '';
  previewData    = signal<any[]>([]);
  previewCols    = signal<string[]>([]);
  previewLoading = signal(false);
  previewTitle   = signal('');
  currentType    = signal('');

  reportTypes = [
    { type:'books',        icon:'❧', label:'Book Inventory',      desc:'Complete list of all books with stock levels and availability status.' },
    { type:'members',      icon:'◑', label:'Members Report',      desc:'All registered library members with join dates and account status.' },
    { type:'fines',        icon:'◉', label:'Fines Report',        desc:'All fine records including amounts, payment status, and methods.' },
    { type:'overdue',      icon:'⚠', label:'Overdue Report',      desc:'Currently borrowed books that have passed their due date.' },
    { type:'transactions', icon:'⇄', label:'Transactions Report', desc:'Full borrowing and returning log. Use the date range filter below.' },
    { type:'dead-stock',   icon:'◈', label:'Dead Stock Report',   desc:'Books that have never been borrowed — helps optimize inventory.' },
  ];

  colMap: Record<string, Record<string,string>> = {
    books:        {'Title':'title','Author':'author','ISBN':'isbn','Category':'category_name','Copies':'total_copies','Available':'available_copies'},
    members:      {'Name':'full_name','Username':'username','Email':'email','Phone':'phone','Joined':'join_date','Status':'status'},
    transactions: {'ID':'transaction_id','Book':'title','Member':'member_name','Issued':'issue_date','Due':'due_date','Returned':'return_date','Status':'status'},
    fines:        {'ID':'fine_id','Book':'title','Member':'member_name','Amount':'amount','Paid':'amount_paid','Method':'payment_method','Status':'status'},
    overdue:      {'Book':'title','Member':'full_name','Email':'email','Due':'due_date'},
    'dead-stock': {'ID':'book_id','Title':'title','Author':'author'},
  };

  constructor(private api: ApiService){}
  ngOnInit(){}

  preview(type: string){
    this.currentType.set(type);
    this.previewLoading.set(true);
    this.previewData.set([]);
    const title = this.reportTypes.find(r => r.type === type)?.label || type;
    this.previewTitle.set(title + ' — Preview');

    const cols = Object.keys(this.colMap[type] || {});
    this.previewCols.set(cols);

    let path = '';
    if(type === 'books')        path = '/books';
    else if(type === 'members') path = '/members';
    else if(type === 'transactions') path = `/reports/transactions?from=${this.fromDate||'1970-01-01'}&to=${this.toDate||'2999-12-31'}`;
    else if(type === 'fines')   path = '/circulation/fines';
    else if(type === 'overdue') path = '/circulation/alerts/overdue';
    else if(type === 'dead-stock') path = '/reports/dead-stock';

    this.api.get<any>(path).subscribe({
      next:(data: any) => {
        const rows = Array.isArray(data) ? data : (data.overdue || []);
        this.previewData.set(rows);
        this.previewLoading.set(false);
      },
      error:() => this.previewLoading.set(false)
    });
  }

  colKey(col: string): string {
    return this.colMap[this.currentType()]?.[col] || col;
  }

  download(type: string, format: 'excel'|'pdf'){
    const params = type === 'transactions' ? `?from=${this.fromDate||''}&to=${this.toDate||''}` : '';
    const url = `${environment.apiUrl}/reports/download/${format}/${type}${params}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `LMS_${type}_Report.${format === 'excel' ? 'xlsx' : 'pdf'}`;

    // Need auth token — open via fetch + blob
    const token = localStorage.getItem('lms_token');
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = a.download;
        link.click();
        URL.revokeObjectURL(blobUrl);
      });
  }
}
