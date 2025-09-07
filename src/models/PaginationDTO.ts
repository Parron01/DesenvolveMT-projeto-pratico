// #region Interfaces
export interface PageableObject {
  pageSize: number
  pageNumber: number
  offset: number
  paged: boolean
  unpaged: boolean
  sort: SortObject
}

export interface SortObject {
  sorted: boolean
  unsorted: boolean
  empty: boolean
}
// #endregion
