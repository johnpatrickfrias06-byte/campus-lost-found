import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/** Small helper that pairs on-screen messages (toasts) with device vibration (Haptics). */
@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly toastCtrl = inject(ToastController);

  async success(message: string): Promise<void> {
    await this.vibrate(() => Haptics.notification({ type: NotificationType.Success }));
    await this.toast(message, 'success');
  }

  async error(message: string): Promise<void> {
    await this.vibrate(() => Haptics.notification({ type: NotificationType.Error }));
    await this.toast(message, 'danger');
  }

  async info(message: string): Promise<void> {
    await this.toast(message, 'medium');
  }

  /** Light tap, used for small confirmations such as a pin being placed. */
  async tap(): Promise<void> {
    await this.vibrate(() => Haptics.impact({ style: ImpactStyle.Light }));
  }

  private async toast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'top', color });
    await toast.present();
  }

  /** Haptics are not available on every device/browser; never let that break the flow. */
  private async vibrate(fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch {
      /* ignore */
    }
  }
}
