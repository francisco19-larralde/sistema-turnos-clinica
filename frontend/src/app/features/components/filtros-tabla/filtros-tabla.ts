import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-filtros-tabla',
  imports: [FormsModule, InputTextModule, ButtonModule, SelectModule, DatePickerModule],
  templateUrl: './filtros-tabla.html',
})
export class FiltrosTabla implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  @Input({ required: true }) tabla!: Table;
  @Input() placeholder = 'Buscar...';
  @Input() filtrosTurnos = false;
  busqueda = '';
  fecha: Date | null = null;
  estado: string | null = null;
  readonly estados = ['PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO'];

  ngOnInit(): void {
    // Mantener el total de la paginación al ampliar o quitar filtros.
    const subscription = this.tabla.onFilter.subscribe(evento => {
      if (!this.tabla.lazy()) this.tabla.totalRecords.set(evento.filteredValue?.length ?? this.tabla.value?.length ?? 0);
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  buscar(valor: string): void {
    this.busqueda = valor;
    this.tabla.filterGlobal(valor.trim(), 'contains');
  }

  filtrarFecha(fecha: Date | null): void {
    this.fecha = fecha;
    const valor = fecha ? [
      fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0'),
    ].join('-') : null;
    this.tabla.filter(valor, 'fecha', 'startsWith');
  }

  filtrarEstado(estado: string | null): void {
    this.estado = estado;
    this.tabla.filter(estado, 'estado', 'equals');
  }

  limpiar(): void {
    this.busqueda = '';
    this.fecha = null;
    this.estado = null;
    this.tabla.clear();
    if (!this.tabla.lazy()) this.tabla.totalRecords.set(this.tabla.value?.length ?? 0);
  }
}
