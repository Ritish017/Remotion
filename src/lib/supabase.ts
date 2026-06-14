/**
 * Local Supabase-compatible client.
 * Routes all queries to the FastAPI /db/{table} endpoints instead of Supabase.
 * Drop-in replacement — the query builder API is identical to supabase-js.
 */

const BASE = process.env.NEXT_PUBLIC_CATALYST_URL || 'http://127.0.0.1:8000'

type Row = Record<string, unknown>
type DbResult<T> = Promise<{ data: T | null; error: Error | null }>
type DbListResult<T> = Promise<{ data: T[] | null; error: Error | null }>

class QueryBuilder<T = Row> {
  private _table: string
  private _op: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private _filters: Record<string, string> = {}
  private _orderCol?: string
  private _orderAsc = true
  private _single = false
  private _insertData?: Row | Row[]
  private _updateData?: Row

  constructor(table: string) {
    this._table = table
  }

  select(_cols = '*'): this {
    // no-op after insert/update — we always return the row
    if (this._op === 'select') this._op = 'select'
    return this
  }

  insert(data: Row | Row[]): this {
    this._op = 'insert'
    this._insertData = data
    return this
  }

  update(data: Row): this {
    this._op = 'update'
    this._updateData = data
    return this
  }

  delete(): this {
    this._op = 'delete'
    return this
  }

  eq(col: string, val: unknown): this {
    this._filters[col] = String(val)
    return this
  }

  order(col: string, opts: { ascending: boolean }): this {
    this._orderCol = col
    this._orderAsc = opts.ascending
    return this
  }

  single(): DbResult<T> {
    this._single = true
    return this._run() as DbResult<T>
  }

  // Makes the builder thenable so `await supabase.from(...).select(...)` works
  then<R>(
    resolve: (v: { data: T[] | T | null; error: Error | null }) => R,
    reject?: (e: unknown) => R
  ): Promise<R> {
    return this._run().then(resolve, reject)
  }

  private async _run(): Promise<{ data: unknown; error: Error | null }> {
    const url = (path: string) => `${BASE}/db/${this._table}${path}`

    try {
      if (this._op === 'select') {
        // Single row by id — use the /{id} route
        if (this._single && this._filters['id']) {
          const r = await fetch(url(`/${this._filters['id']}`))
          const j = await r.json()
          if (!r.ok) return { data: null, error: new Error(j.detail ?? 'Not found') }
          return { data: j as T, error: null }
        }

        // List with optional filters + ordering
        const params = new URLSearchParams()
        for (const [k, v] of Object.entries(this._filters)) params.set(`filter_${k}`, v)
        if (this._orderCol) {
          params.set('order_col', this._orderCol)
          params.set('order_dir', this._orderAsc ? 'asc' : 'desc')
        }
        const r = await fetch(url(`?${params.toString()}`))
        const j = await r.json()
        if (!r.ok) return { data: null, error: new Error(j.detail ?? 'Error') }
        const rows = j as T[]
        return { data: this._single ? (rows[0] ?? null) : rows, error: null }
      }

      if (this._op === 'insert') {
        const r = await fetch(url(''), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this._insertData),
        })
        const j = await r.json()
        if (!r.ok) return { data: null, error: new Error(j.detail ?? 'Insert failed') }
        // Backend returns the row (or array). single() collapses to first item.
        const result = Array.isArray(j) && this._single ? j[0] ?? null : j
        return { data: result as T, error: null }
      }

      if (this._op === 'update') {
        const id = this._filters['id']
        if (!id) return { data: null, error: new Error('update() requires .eq("id", ...)') }
        const r = await fetch(url(`/${id}`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this._updateData),
        })
        const j = await r.json()
        if (!r.ok) return { data: null, error: new Error(j.detail ?? 'Update failed') }
        return { data: j as T, error: null }
      }

      if (this._op === 'delete') {
        const id = this._filters['id']
        if (!id) return { data: null, error: new Error('delete() requires .eq("id", ...)') }
        const r = await fetch(url(`/${id}`), { method: 'DELETE' })
        const j = await r.json()
        if (!r.ok) return { data: null, error: new Error(j.detail ?? 'Delete failed') }
        return { data: j, error: null }
      }

      return { data: null, error: new Error('Unknown operation') }
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) }
    }
  }
}

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
  auth: {
    getUser: async () => ({ data: { user: { id: 'local', email: 'local@catalyst.dev' } }, error: null }),
    signOut: async () => ({ error: null }),
  },
}
