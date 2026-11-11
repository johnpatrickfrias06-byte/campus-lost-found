import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AlertController, IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonSpinner,
  IonTitle, IonToolbar, NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, refresh, trash } from 'ionicons/icons';
import { ItemService } from '../../services/item.service';
import { FeedbackService } from '../../services/feedback.service';
import { MapViewComponent } from '../../components/map-view.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    DatePipe, MapViewComponent, IonBackButton, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon,
    IonSpinner, IonTitle, IonToolbar,
  ],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
})
export class DetailPage {
  /** Bound from the route parameter `:id`. */
  readonly id = input.required<string>();

  protected readonly store = inject(ItemService);
  private readonly feedback = inject(FeedbackService);
  private readonly alertCtrl = inject(AlertController);
  private readonly nav = inject(NavController);

  protected readonly item = computed(() => this.store.items().find((i) => i.id === this.id()));

  constructor() {
    addIcons({ checkmarkCircle, refresh, trash });
  }

  protected async toggleResolved(): Promise<void> {
    const it = this.item();
    if (!it) return;
    try {
      await this.store.toggleResolved(it.id);
      await this.feedback.success(it.resolved ? 'Marked as active again.' : 'Marked as returned.');
    } catch {
      await this.feedback.error('Could not update the item.');
    }
  }

  protected async confirmDelete(): Promise<void> {
    const it = this.item();
    if (!it) return;
    const alert = await this.alertCtrl.create({
      header: 'Delete report?',
      message: 'This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.delete(it.id);
          },
        },
      ],
    });
    await alert.present();
  }

  private async delete(id: string): Promise<void> {
    try {
      await this.store.remove(id);
      await this.feedback.info('Report deleted.');
      await this.nav.navigateBack('/home');
    } catch {
      await this.feedback.error('Could not delete the item.');
    }
  }
}
