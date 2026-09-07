import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Table, TableModule } from 'primeng/table';
import { FiltrosTabla } from './filtros-tabla';
import { vi } from 'vitest';

@Component({
  imports: [TableModule, FiltrosTabla, DatePipe],
  template: `
    <p-table #tabla [value]="datos" [paginator]="true" [rows]="1" [filterDelay]="0" [globalFilterFields]="['nombre']">
      <ng-template #caption><app-filtros-tabla [tabla]="tabla" [filtrosTurnos]="true" /></ng-template>
      <ng-template #body let-dato><tr><td>{{ dato.fecha | date:'dd/MM/yyyy':'UTC' }}</td></tr></ng-template>
    </p-table>
  `,
})
class PruebaTabla {
  @ViewChild(Table) tabla!: Table;
  @ViewChild(FiltrosTabla) filtros!: FiltrosTabla;
  datos = [
    { nombre: 'Ana', fecha: '2026-09-18T00:00:00.000Z', estado: 'PENDIENTE' },
    { nombre: 'Ana', fecha: '2026-09-19T00:00:00.000Z', estado: 'CONFIRMADO' },
    { nombre: 'Luis', fecha: '2026-09-18T00:00:00.000Z', estado: 'CONFIRMADO' },
  ];
}

describe('Filtros y paginación', () => {
  it('combina filtros, vuelve a la primera página y permite limpiarlos', async () => {
    await TestBed.configureTestingModule({ imports: [PruebaTabla] }).compileComponents();
    const fixture = TestBed.createComponent(PruebaTabla);
    await fixture.whenStable();
    const { tabla, filtros } = fixture.componentInstance;
    tabla.first.set(2);
    filtros.buscar('Ana');
    filtros.filtrarFecha(new Date(2026, 8, 18));
    filtros.filtrarEstado('PENDIENTE');
    await vi.waitFor(() => expect(tabla.filteredValue?.length).toBe(1));
    await fixture.whenStable();
    expect(tabla.filteredValue?.[0].fecha).toBe('2026-09-18T00:00:00.000Z');
    expect(tabla.first()).toBe(0);
    expect(fixture.nativeElement.querySelector('tbody td').textContent).toContain('18/09/2026');
    filtros.limpiar();
    await fixture.whenStable();
    expect(tabla.totalRecords()).toBe(3);
    expect(filtros.fecha).toBeNull();
    expect(filtros.estado).toBeNull();
    expect(filtros.busqueda).toBe('');
  });
});
