import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { DataService } from '../core/data.service';
import { Cliente } from '../core/models';

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent {
  private readonly data = inject(DataService);
  readonly auth = inject(AuthService);
  clientes: Cliente[] = [];
  error = '';
  success = '';
  cargando = true;
  eliminandoId: number | null = null;
  form: Partial<Cliente> = {};

  constructor() { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.data.clientes().subscribe({
      next: rows => { this.clientes = rows; this.error = ''; this.cargando = false; },
      error: () => { this.error = 'No se pudo conectar con la API.'; this.cargando = false; },
    });
  }

  crear(): void {
    if (!this.auth.isAdmin()) return;
    this.error = ''; this.success = '';
    this.data.crearCliente(this.form).subscribe({
      next: () => { this.form = {}; this.success = 'Cliente creado correctamente.'; this.cargar(); },
      error: e => { this.error = e.error?.error || 'No se pudo guardar el cliente.'; },
    });
  }

  eliminar(cliente: Cliente): void {
    if (!this.auth.isAdmin() || this.eliminandoId !== null) return;
    if (!window.confirm(`¿Eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`)) return;
    this.error = ''; this.success = ''; this.eliminandoId = cliente.id;
    this.data.eliminarCliente(cliente.id).subscribe({
      next: () => {
        this.clientes = this.clientes.filter(row => row.id !== cliente.id);
        this.success = 'Cliente eliminado correctamente.';
        this.eliminandoId = null;
      },
      error: e => {
        this.error = e.error?.error || 'No se pudo eliminar el cliente.';
        this.eliminandoId = null;
      },
    });
  }
}
