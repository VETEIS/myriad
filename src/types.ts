export interface ColumnConfig {
  id: string
  name: string
  basePrice: number       // rice selling price
  pricePerCount: number   // siomai selling price per pc
  riceCost?: number       // rice capital cost
  siomaiCostPerPc?: number // siomai capital cost per pc
}

export interface CellRow {
  id: string
  values: number[] // count of siomai per column
}

export interface CompletedOrderItem {
  colName: string
  count: number
  subtotal: number
}

export interface CompletedOrder {
  id: string
  customerName: string
  columns: ColumnConfig[]
  rows: CellRow[]
  totalAmount: number
  totalCost?: number      // total capital cost for this order
  completedAt: number
}

export interface SheetState {
  id: string
  customerName: string
  columns: ColumnConfig[]
  rows: CellRow[]
  history: CompletedOrder[]
  createdAt: number
  updatedAt: number
}

export type SheetAction =
  | { type: 'APPLY_SETUP'; columns: ColumnConfig[]; customerName: string }
  | { type: 'SET_CUSTOMER_NAME'; customerName: string }
  | { type: 'INCREMENT'; rowId: string; colIndex: number }
  | { type: 'DECREMENT'; rowId: string; colIndex: number }
  | { type: 'ADD_ROW' }
  | { type: 'COMPLETE_ORDER' }
  | { type: 'DELETE_HISTORY_ITEM'; orderId: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'LOAD'; state: SheetState }
