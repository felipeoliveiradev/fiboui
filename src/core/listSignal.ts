import { Signal, computed, type ComputedSignal } from './state';
import { interp } from './interpolate';

export type ListItemId = string | number;

/** Every object in a `listSignal` gets a stable internal key. */
export type ListEntity<T extends object = object> = T & { _id: string };

export type ListMatcher<T> =
  | ListItemId
  | ((item: T, index: number) => boolean);

function createListId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `lst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function hasOwnId(item: object): item is { _id: string } {
  return (
    typeof (item as { _id?: unknown })._id === 'string' &&
    (item as { _id: string })._id.length > 0
  );
}

/** Stamp `_id` if missing. Keeps an existing `_id`. */
export function ensureListId<T extends object>(item: T): ListEntity<T> {
  if (hasOwnId(item)) {
    return item as ListEntity<T>;
  }
  return { ...(item as object), _id: createListId() } as ListEntity<T>;
}

function matchItem<T>(item: T, index: number, matcher: ListMatcher<T>): boolean {
  if (typeof matcher === 'function') {
    return matcher(item, index);
  }
  if (item != null && typeof item === 'object') {
    const rec = item as unknown as { _id?: ListItemId; id?: ListItemId };
    if (rec._id != null && rec._id === matcher) return true;
    if (rec.id != null && rec.id === matcher) return true;
    return false;
  }
  return (item as unknown) === matcher;
}

function applyPatch<T extends object>(
  item: ListEntity<T>,
  patch: Partial<T> | ((item: ListEntity<T>) => T | ListEntity<T>)
): ListEntity<T> {
  if (typeof patch === 'function') {
    return ensureListId({ ...patch(item), _id: item._id } as T);
  }
  // Never drop / overwrite `_id` via accidental patch.
  const { _id: _ignored, ...rest } = patch as Partial<T> & { _id?: string };
  return { ...item, ...rest, _id: item._id };
}

/**
 * Reactive list — auto-stamps a UUID `_id` on every object.
 * Use `_id` for update/remove/find; your domain fields stay free of ids.
 *
 * ```ts
 * const todos = listSignal<{ title: string }>([])
 * todos.add({ title: 'Ship' })              // → { title: 'Ship', _id: '…' }
 * todos.update(todo._id, { title: 'Done' })
 * todos.remove(todo._id)
 * ```
 */
export class ListSignal<T extends object> extends Signal<ListEntity<T>[]> {
  private _$length?: ComputedSignal<number>;

  constructor(initial: Array<T | ListEntity<T>> = []) {
    super((Array.isArray(initial) ? initial : []).map((item) => ensureListId(item)));
  }

  get length(): number {
    return this.value.length;
  }

  /**
   * Reactive length for plain templates:
   * `Text(\`Total todos: ${todos.$length}\`)`
   *
   * Embeds a marker via `interp()`; `Text` resolves it on each update.
   * (`todos.length` is a plain number and still freezes — use `$length`.)
   */
  get $length(): string {
    if (!this._$length) {
      this._$length = computed(() => this.value.length);
    }
    return interp(this._$length);
  }

  /** Replace the whole array (missing `_id`s are generated). */
  set(items: Array<T | ListEntity<T>>): this {
    this.value = items.map((item) => ensureListId(item));
    return this;
  }

  clear(): this {
    this.value = [];
    return this;
  }

  /** Append items — each gets `_id` if not already set. */
  add(...items: Array<T | ListEntity<T>>): this {
    if (items.length === 0) return this;
    this.value = [...this.value, ...items.map((item) => ensureListId(item))];
    return this;
  }

  /** Insert at index (clamped). */
  insert(index: number, item: T | ListEntity<T>): this {
    const next = [...this.value];
    const i = Math.max(0, Math.min(index, next.length));
    next.splice(i, 0, ensureListId(item));
    this.value = next;
    return this;
  }

  /**
   * Patch by `_id` / `id` / predicate.
   * `patch` can be a partial object or a mapper.
   */
  update(
    matcher: ListMatcher<ListEntity<T>>,
    patch: Partial<T> | ((item: ListEntity<T>) => T | ListEntity<T>)
  ): this {
    let changed = false;
    const next = this.value.map((item, index) => {
      if (!matchItem(item, index, matcher)) return item;
      changed = true;
      return applyPatch(item, patch);
    });
    if (changed) this.value = next;
    return this;
  }

  /** Replace the first match (keeps original `_id` unless `item` already has one). */
  replace(matcher: ListMatcher<ListEntity<T>>, item: T | ListEntity<T>): this {
    const idx = this.value.findIndex((it, i) => matchItem(it, i, matcher));
    if (idx < 0) return this;
    const prev = this.value[idx];
    const next = [...this.value];
    next[idx] = hasOwnId(item as object)
      ? (item as ListEntity<T>)
      : ({ ...(item as object), _id: prev._id } as ListEntity<T>);
    this.value = next;
    return this;
  }

  /** Remove by `_id` / `id` / predicate. Alias: `delete`. */
  remove(matcher: ListMatcher<ListEntity<T>>): this {
    const next = this.value.filter((item, index) => !matchItem(item, index, matcher));
    if (next.length !== this.value.length) {
      this.value = next;
    }
    return this;
  }

  delete(matcher: ListMatcher<ListEntity<T>>): this {
    return this.remove(matcher);
  }

  find(matcher: ListMatcher<ListEntity<T>>): ListEntity<T> | undefined {
    return this.value.find((item, index) => matchItem(item, index, matcher));
  }

  search(query: string, keys?: (keyof T)[]): ListEntity<T>[] {
    const q = query.trim().toLowerCase();
    if (!q) return [...this.value];

    return this.value.filter((item) => {
      const record = item as Record<string, unknown>;
      const fields =
        keys && keys.length > 0
          ? keys.map((k) => record[k as string])
          : Object.entries(record)
              .filter(([k]) => k !== '_id')
              .map(([, v]) => v);
      return fields.some((v) => {
        if (v == null) return false;
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          return String(v).toLowerCase().includes(q);
        }
        return false;
      });
    });
  }

  filter(predicate: (item: ListEntity<T>, index: number) => boolean): ListEntity<T>[] {
    return this.value.filter(predicate);
  }

  map<U>(fn: (item: ListEntity<T>, index: number) => U): U[] {
    return this.value.map(fn);
  }

  move(from: number, to: number): this {
    const list = [...this.value];
    if (from < 0 || from >= list.length) return this;
    const target = Math.max(0, Math.min(to, list.length - 1));
    if (from === target) return this;
    const [item] = list.splice(from, 1);
    list.splice(target, 0, item);
    this.value = list;
    return this;
  }
}

export function listSignal<T extends object>(
  initial: Array<T | ListEntity<T>> = []
): ListSignal<T> {
  return new ListSignal<T>(initial);
}

/** Alias — same as `listSignal`. */
export const collection = listSignal;
