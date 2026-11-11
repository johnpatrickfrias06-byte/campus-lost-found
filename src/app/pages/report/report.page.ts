import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonNote,
  IonSegment, IonSegmentButton, IonLabel, IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, locate, trash } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { CATEGORIES, ItemType } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { FeedbackService } from '../../services/feedback.service';
import { LatLng, MapViewComponent } from '../../components/map-view.component';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    ReactiveFormsModule, MapViewComponent, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon,
    IonInput, IonLabel, IonNote, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonSpinner,
    IonTextarea, IonTitle, IonToolbar,
  ],
  templateUrl: './report.page.html',
  styleUrl: './report.page.scss',
})
export class ReportPage {
  private readonly fb = inject(FormBuilder);
  private readonly items = inject(ItemService);
  private readonly feedback = inject(FeedbackService);
  private readonly nav = inject(NavController);

  protected readonly categories = CATEGORIES;

  protected readonly form = this.fb.nonNullable.group({
    type: ['lost' as ItemType, Validators.required],
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    category: ['Other', Validators.required],
    description: ['', Validators.maxLength(300)],
    locationNote: ['', Validators.maxLength(80)],
    contact: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(80)]],
  });

  protected readonly photo = signal<string | undefined>(undefined);
  protected readonly coords = signal<LatLng | null>(null);
  protected readonly locating = signal(false);
  protected readonly saving = signal(false);

  constructor() {
    addIcons({ camera, locate, trash });
  }

  protected onType(ev: CustomEvent): void {
    this.form.controls.type.setValue((ev.detail.value as ItemType) ?? 'lost');
  }

  /** CAMERA: take a photo or choose one from the gallery. */
  protected async takePhoto(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 60, // keeps the stored image small
        width: 800,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // asks: camera or gallery
        promptLabelHeader: 'Item photo',
      });
      this.photo.set(image.dataUrl);
    } catch (err) {
      // Closing the camera without taking a photo is not an error.
      if (!String(err).toLowerCase().includes('cancel')) {
        await this.feedback.error('Could not get the photo. Check camera permission.');
      }
    }
  }

  /** GEOLOCATION: fill the map pin with the device's current position. */
  protected async useMyLocation(): Promise<void> {
    this.locating.set(true);
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      this.coords.set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      await this.feedback.tap();
    } catch {
      await this.feedback.error('Could not get your location. Turn on GPS and allow location access, or tap the map.');
    } finally {
      this.locating.set(false);
    }
  }

  protected onPicked(p: LatLng): void {
    this.coords.set(p);
    void this.feedback.tap();
  }

  protected clearPhoto(): void {
    this.photo.set(undefined);
  }

  protected showError(name: 'title' | 'contact'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.feedback.error('Please fill in the required fields.');
      return;
    }
    this.saving.set(true);
    try {
      const c = this.coords();
      await this.items.add({
        ...this.form.getRawValue(),
        title: this.form.controls.title.value.trim(),
        photo: this.photo(),
        lat: c?.lat,
        lng: c?.lng,
      });
      await this.feedback.success('Report saved.');
      await this.nav.navigateBack('/home');
    } catch (err) {
      console.error(err);
      await this.feedback.error('Could not save the report. Storage may be full; try removing the photo.');
    } finally {
      this.saving.set(false);
    }
  }
}
