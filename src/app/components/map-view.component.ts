import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, input, output } from '@angular/core';
import * as L from 'leaflet';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../models/map.config';

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Reusable Leaflet map.
 *  - read-only (detail page): shows one pin
 *  - interactive (report page): tap the map or drag the pin to choose a location
 */
@Component({
  selector: 'app-map-view',
  standalone: true,
  template: `<div #mapEl class="map"></div>`,
  styles: [
    `
      :host { display: block; }
      .map { height: 100%; width: 100%; min-height: 220px; border-radius: 12px; overflow: hidden; }
    `,
  ],
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  readonly lat = input<number | null>(null);
  readonly lng = input<number | null>(null);
  readonly interactive = input(false);
  readonly picked = output<LatLng>();

  @ViewChild('mapEl', { static: true }) private mapEl!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.Marker;
  private resizeObserver?: ResizeObserver;

  constructor() {
    // Re-draw the pin whenever the lat/lng inputs change (e.g. after "Use my location").
    effect(() => {
      this.syncMarker(this.lat(), this.lng());
    });
  }

  ngAfterViewInit(): void {
    const lat = this.lat();
    const lng = this.lng();
    const center: L.LatLngExpression = lat != null && lng != null ? [lat, lng] : DEFAULT_MAP_CENTER;

    this.map = L.map(this.mapEl.nativeElement).setView(center, DEFAULT_MAP_ZOOM);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    if (this.interactive()) {
      this.map.on('click', (e: L.LeafletMouseEvent) => this.picked.emit({ lat: e.latlng.lat, lng: e.latlng.lng }));
    }

    this.syncMarker(lat, lng);

    // Pages animate in, so the container size can change after creation. Without this the map shows grey tiles.
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private syncMarker(lat: number | null, lng: number | null): void {
    if (!this.map) return;
    if (lat == null || lng == null) {
      this.marker?.remove();
      this.marker = undefined;
      return;
    }
    const pos: L.LatLngExpression = [lat, lng];
    if (!this.marker) {
      const icon = L.divIcon({ className: 'pin', html: '<span></span>', iconSize: [26, 26], iconAnchor: [13, 26] });
      this.marker = L.marker(pos, { icon, draggable: this.interactive() }).addTo(this.map);
      this.marker.on('dragend', () => {
        const p = this.marker!.getLatLng();
        this.picked.emit({ lat: p.lat, lng: p.lng });
      });
    } else {
      this.marker.setLatLng(pos);
    }
    this.map.setView(pos, Math.max(this.map.getZoom(), DEFAULT_MAP_ZOOM));
  }
}
