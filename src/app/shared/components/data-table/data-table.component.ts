import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableColumn } from './table-column.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent<T extends Record<string, any> = any> implements OnChanges, AfterContentInit {
  /** Full row dataset (the component handles searching / sorting / pagination client-side). */
  @Input() data: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() searchable = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() pageSize = 10;
  @Input() emptyMessage = 'No records found';
  @Input() emptyIcon = 'fa-solid fa-inbox';
  @Input() trackByKey = 'id';

  /** Emits the raw row when its action button(s) (projected template) need contextual data - not required if using the rowActions template. */
  @Output() rowClicked = new EventEmitter<T>();

  /** Optional row-actions cell, projected from the parent:
   *  <ng-template #rowActions let-row>...buttons...</ng-template>
   */
  @ContentChild('rowActions') rowActionsTemplate?: TemplateRef<any>;

  searchTerm = '';
  sortKey: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;

  filteredAndSorted: T[] = [];
  pagedData: T[] = [];

  ngAfterContentInit(): void {
    this.recompute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.currentPage = 1;
    }
    this.recompute();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
    this.recompute();
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;
    if (this.sortKey === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = column.key;
      this.sortDirection = 'asc';
    }
    this.recompute();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.recompute();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAndSorted.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const range: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  get rangeStart(): number {
    if (this.filteredAndSorted.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredAndSorted.length);
  }

  resolveValue(row: any, key: string): any {
    return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), row);
  }

  trackByFn = (_: number, row: T) => this.resolveValue(row, this.trackByKey) ?? _;

  private recompute(): void {
    let result = [...(this.data || [])];

    if (this.searchable && this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(row =>
        this.columns.some(col => {
          const val = this.resolveValue(row, col.key);
          return val != null && String(val).toLowerCase().includes(term);
        })
      );
    }

    if (this.sortKey) {
      const key = this.sortKey;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const av = this.resolveValue(a, key);
        const bv = this.resolveValue(b, key);
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * dir;
        if (bv == null) return 1 * dir;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }

    this.filteredAndSorted = result;
    this.applyPagination();
  }

  private applyPagination(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedData = this.filteredAndSorted.slice(start, start + this.pageSize);
  }
}
