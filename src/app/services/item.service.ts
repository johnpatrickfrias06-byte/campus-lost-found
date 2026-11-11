import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Item, NewItem } from '../models/item.model';

const STORAGE_KEY = 'lost_found_items';

/**
 * Local data layer. Items live in a signal (so screens update automatically)
 * and every change is written to Capacitor Preferences (SharedPreferences on Android).
 * Provides the Create / Read / Update / Delete operations used by the app.
 */
@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly _items = signal<Item[]>([]);
  private readonly _loaded = signal(false);

  readonly items = this._items.asReadonly();
  /** false until the first read from storage has finished. */
  readonly loaded = this._loaded.asReadonly();

  constructor() {
    void this.load();
  }

  // READ
  private async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      const parsed: unknown = value ? JSON.parse(value) : [];
      this._items.set(Array.isArray(parsed) ? (parsed as Item[]) : []);
    } catch (err) {
      // Corrupt or unreadable data should not break the app: start empty.
      console.error('Could not load items', err);
      this._items.set([]);
    } finally {
      this._loaded.set(true);
    }
  }

  getById(id: string): Item | undefined {
    return this._items().find((i) => i.id === id);
  }

  // CREATE
  async add(data: NewItem): Promise<Item> {
    const item: Item = {
      ...data,
      id: this.newId(),
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    await this.persist([item, ...this._items()]);
    return item;
  }

  // UPDATE
  async toggleResolved(id: string): Promise<void> {
    await this.persist(this._items().map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i)));
  }

  // DELETE
  async remove(id: string): Promise<void> {
    await this.persist(this._items().filter((i) => i.id !== id));
  }

  /** Write first, then update the signal, so the UI never shows data that was not saved. */
  private async persist(next: Item[]): Promise<void> {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(next) });
    this._items.set(next);
  }

  private newId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
