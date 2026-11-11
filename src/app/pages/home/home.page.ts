import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonBadge, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonList,
  IonNote, IonSearchbar, IonSegment, IonSegmentButton, IonSpinner, IonThumbnail, IonTitle, IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, imageOutline, searchOutline } from 'ionicons/icons';
import { ItemService } from '../../services/item.service';

type Filter = 'all' | 'lost' | 'found' | 'returned';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DatePipe, RouterLink, IonBadge, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel,
    IonList, IonNote, IonSearchbar, IonSegment, IonSegmentButton, IonSpinner, IonThumbnail, IonTitle, IonToolbar,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly store = inject(ItemService);

  protected readonly query = signal('');
  protected readonly filter = signal<Filter>('all');

  /** Items after applying the segment filter and the search text, newest first. */
  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.store
      .items()
      .filter((i) => (f === 'returned' ? i.resolved : !i.resolved && (f === 'all' || i.type === f)))
      .filter((i) => !q || [i.title, i.description, i.category, i.locationNote].join(' ').toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  constructor() {
    addIcons({ add, imageOutline, searchOutline });
  }

  protected onFilter(ev: CustomEvent): void {
    this.filter.set((ev.detail.value as Filter) ?? 'all');
  }

  protected onSearch(ev: CustomEvent): void {
    this.query.set((ev.detail.value as string) ?? '');
  }
}
