export type ColumnType = 'text' | 'badge' | 'date' | 'currency' | 'boolean' | 'custom';

export interface TableColumn {
  /** Property key on the row object (supports dot-path, e.g. "student.fullName") */
  key: string;
  /** Column header label */
  label: string;
  /** Whether the column can be sorted by clicking its header */
  sortable?: boolean;
  /** Rendering hint */
  type?: ColumnType;
  /** Optional map of value -> bootstrap badge class, used when type === 'badge' */
  badgeMap?: Record<string, string>;
  /** Optional fixed width (css value) */
  width?: string;
}
