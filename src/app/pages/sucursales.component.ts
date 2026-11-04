import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { SerieMensual, Sucursal } from '../core/models';

@Component({
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './sucursales.component.html',
})
export class SucursalesComponent {
  private readonly data = inject(DataService);
  readonly auth = inject(AuthService);
  sucursales: Sucursal[] = [];
  series: SerieMensual[] = [];
  form: Partial<Sucursal> = {};
  mostrarForm = false;
  anio = new Date().getFullYear();
  years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i);
  sucursalFiltro = 0;
  error = '';
  success = '';
  cargando = true;
  eliminandoId: number | null = null;
  readonly ticks = [0, 1, 2, 3, 4];
  readonly monthLabels = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  readonly colors = ['#4a76a8', '#45a049', '#ff9800', '#c94f7c', '#7b5ea7'];
  readonly monthWidth = 520 / 12;

  constructor() {
    this.data.sucursales().subscribe({ next: rows => { this.sucursales = rows; this.cargando = false; }, error: () => { this.error = 'No se pudieron cargar las sucursales.'; this.cargando = false; } });
    this.cargarSeries();
  }

  get filteredSeries(): SerieMensual[] {
    return this.series.filter(row => !this.sucursalFiltro || row.sucursal_id === this.sucursalFiltro);
  }

  cargarSeries(): void {
    this.data.series(this.anio).subscribe({ next: rows => { this.series = rows; this.error = ''; }, error: () => { this.error = 'No se pudieron cargar los datos de ventas.'; } });
  }

  crear(): void {
    if (!this.auth.isAdmin()) return;
    this.error = ''; this.success = '';
    this.data.crearSucursal(this.form).subscribe({
      next: () => {
        this.form = {};
        this.mostrarForm = false;
        this.success = 'Sucursal creada correctamente.';
        this.data.sucursales().subscribe(rows => { this.sucursales = rows; });
        this.cargarSeries();
      },
      error: e => { this.error = e.error?.error || 'No se pudo crear la sucursal.'; },
    });
  }

  eliminar(sucursal: Sucursal): void {
    if (!this.auth.isAdmin() || this.eliminandoId !== null) return;
    if (!window.confirm(`¿Eliminar la sucursal ${sucursal.nombre}?`)) return;
    this.error = ''; this.success = ''; this.eliminandoId = sucursal.id;
    this.data.eliminarSucursal(sucursal.id).subscribe({
      next: () => {
        this.sucursales = this.sucursales.filter(row => row.id !== sucursal.id);
        this.series = this.series.filter(row => row.sucursal_id !== sucursal.id);
        if (this.sucursalFiltro === sucursal.id) this.sucursalFiltro = 0;
        this.success = 'Sucursal eliminada correctamente.';
        this.eliminandoId = null;
        this.cargarSeries();
      },
      error: e => { this.error = e.error?.error || 'No se pudo eliminar la sucursal.'; this.eliminandoId = null; },
    });
  }

  eliminarPorId(id: number): void {
    const sucursal = this.sucursales.find(row => row.id === id);
    if (sucursal) this.eliminar(sucursal);
  }

  direccion(id: number): string { return this.sucursales.find(row => row.id === id)?.direccion || '—'; }
  empleados(id: number): number { return this.sucursales.find(row => row.id === id)?.empleados ?? 0; }
  color(index: number): string { return this.colors[index % this.colors.length]; }
  maxSingle(): number { return Math.max(1, ...this.filteredSeries.flatMap(row => row.meses)); }
  maxStack(): number { return Math.max(1, ...this.monthLabels.map((_, month) => this.filteredSeries.reduce((sum, row) => sum + row.meses[month], 0))); }
  scaledHeight(value: number, max: number): number { return 230 * value / max; }
  tickY(tick: number): number { return 260 - 230 * tick / 4; }
  tickValue(tick: number, stacked: boolean): number { return (stacked ? this.maxStack() : this.maxSingle()) * tick / 4; }
  monthX(month: number): number { return 50 + month * this.monthWidth; }
  monthCenter(month: number): number { return this.monthX(month) + this.monthWidth / 2; }
  stackTop(month: number, branch: number, value: number): number {
    const below = this.filteredSeries.slice(0, branch).reduce((sum, row) => sum + row.meses[month], 0);
    return 260 - this.scaledHeight(below + value, this.maxStack());
  }
  groupBarWidth(): number { return this.filteredSeries.length ? (this.monthWidth * 0.7) / this.filteredSeries.length : 0; }
  groupX(month: number, branch: number): number { return this.monthX(month) + this.monthWidth * 0.15 + branch * this.groupBarWidth(); }
  linePoints(values: number[]): string { return values.map((value, month) => `${this.monthCenter(month)},${260 - this.scaledHeight(value, this.maxSingle())}`).join(' '); }
}
