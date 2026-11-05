import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { Cliente, Sucursal, Venta } from '../core/models';

interface FormVenta {
  cliente_id: number | null;
  sucursal_id: number | null;
  fecha: string;
  detalle: string;
  total: number;
}
interface FormEdicionVenta {
  cliente_id: number;
  sucursal_id: number;
  fecha: string;
  detalle: string;
  cantidad: number;
  precio_unitario: number;
}

@Component({
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './ventas.component.html',
})
export class VentasComponent {
  private readonly data = inject(DataService);
  readonly auth = inject(AuthService);
  ventas: Venta[] = [];
  clientes: Cliente[] = [];
  sucursales: Sucursal[] = [];
  cargando = true;
  guardando = false;
  error = '';
  success = '';
  mostrarForm = false;
  invoice: any = null;
  editandoId: number | null = null;
  actualizandoId: number | null = null;
  eliminandoId: number | null = null;
  readonly monthLabels = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  form: FormVenta = { cliente_id: null, sucursal_id: null, fecha: this.today(), detalle: '', total: 0 };
  editForm: FormEdicionVenta = { cliente_id: 0, sucursal_id: 0, fecha: this.today(), detalle: '', cantidad: 1, precio_unitario: 0 };

  constructor() {
    this.mostrarForm = inject(ActivatedRoute).snapshot.url.some(segment => segment.path === 'nueva');
    this.cargar();
    this.data.clientes().subscribe({ next: rows => { this.clientes = rows; }, error: () => { this.error = 'No se pudieron cargar los clientes.'; } });
    this.data.sucursales().subscribe({ next: rows => { this.sucursales = rows; }, error: () => { this.error = 'No se pudieron cargar las sucursales.'; } });
  }

  private today(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  cargar(): void {
    this.cargando = true;
    this.data.ventas().subscribe({
      next: rows => { this.ventas = rows; this.cargando = false; this.error = ''; },
      error: e => { this.error = e.error?.error || 'No se pudieron cargar las ventas.'; this.cargando = false; },
    });
  }

  get currentYear(): number { return new Date().getFullYear(); }
  get totalAnio(): number { return this.ventas.filter(v => Number(v.fecha.slice(0, 4)) === this.currentYear).reduce((sum, v) => sum + Number(v.total), 0); }
  get promedio(): number { return this.ventas.length ? this.ventas.reduce((sum, v) => sum + Number(v.total), 0) / this.ventas.length : 0; }
  get totalEdicion(): number { return Math.round((Number(this.editForm.cantidad) * Number(this.editForm.precio_unitario) + Number.EPSILON) * 100) / 100; }
  monthlyTotal(month: number): number { return this.ventas.filter(v => Number(v.fecha.slice(0, 4)) === this.currentYear && Number(v.fecha.slice(5, 7)) === month + 1).reduce((sum, v) => sum + Number(v.total), 0); }
  monthlyHeight(month: number): number { const max = Math.max(1, ...this.monthLabels.map((_, i) => this.monthlyTotal(i))); return this.monthlyTotal(month) === 0 ? 0 : Math.max(4, 100 * this.monthlyTotal(month) / max); }

  crear(): void {
    if (!this.auth.isAdmin() || this.guardando) return;
    this.error = ''; this.success = ''; this.guardando = true;
    const payload = { ...this.form };
    this.data.crearVenta(payload).subscribe({
      next: (result: any) => {
        this.invoice = { id: result.id, numero_factura: result.numero_factura, cliente: this.clientes.find(c => c.id === Number(payload.cliente_id)), sucursal: this.sucursales.find(s => s.id === Number(payload.sucursal_id)), fecha: payload.fecha, detalle: payload.detalle, cantidad: 1, precio_unitario: Number(payload.total), total: Number(payload.total) };
        this.form = { cliente_id: null, sucursal_id: null, fecha: this.today(), detalle: '', total: 0 };
        this.mostrarForm = false; this.success = `Factura ${result.numero_factura} creada correctamente.`; this.guardando = false; this.cargar();
      },
      error: e => { this.error = e.error?.error || 'No se pudo guardar la factura.'; this.guardando = false; },
    });
  }

  editar(sale: Venta): void {
    if (!this.auth.isAdmin()) return;
    this.error = ''; this.success = ''; this.editandoId = sale.id;
    this.editForm = { cliente_id: sale.cliente_id, sucursal_id: sale.sucursal_id, fecha: sale.fecha.slice(0, 10), detalle: sale.detalle, cantidad: sale.cantidad || 1, precio_unitario: sale.precio_unitario || sale.total };
  }

  cancelarEdicion(): void { this.editandoId = null; }

  guardarEdicion(id: number): void {
    if (!this.auth.isAdmin() || this.actualizandoId !== null) return;
    this.error = ''; this.success = ''; this.actualizandoId = id;
    this.data.actualizarVenta(id, this.editForm).subscribe({
      next: result => {
        const sale = this.ventas.find(row => row.id === id);
        if (sale && this.invoice?.id === id) {
          this.invoice = { ...this.invoice, numero_factura: result.numero_factura, cliente: this.clientes.find(c => c.id === this.editForm.cliente_id), sucursal: this.sucursales.find(s => s.id === this.editForm.sucursal_id), ...this.editForm, total: result.total };
        }
        this.editandoId = null; this.actualizandoId = null; this.success = `Factura ${result.numero_factura} actualizada correctamente.`; this.cargar();
      },
      error: e => { this.error = e.error?.error || 'No se pudo actualizar la factura.'; this.actualizandoId = null; },
    });
  }

  eliminar(sale: Venta): void {
    if (!this.auth.isAdmin() || this.eliminandoId !== null) return;
    if (!window.confirm(`¿Eliminar la factura ${sale.numero_factura}? Esta acción no se puede deshacer.`)) return;
    this.error = ''; this.success = ''; this.eliminandoId = sale.id;
    this.data.eliminarVenta(sale.id).subscribe({
      next: result => {
        this.ventas = this.ventas.filter(row => row.id !== sale.id);
        if (this.invoice?.id === sale.id) this.invoice = null;
        if (this.editandoId === sale.id) this.editandoId = null;
        this.success = `Factura ${result.numero_factura} eliminada correctamente.`; this.eliminandoId = null;
      },
      error: e => { this.error = e.error?.error || 'No se pudo eliminar la factura.'; this.eliminandoId = null; },
    });
  }

  printInvoice(): void { window.print(); }
}
