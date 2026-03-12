import { NextResponse } from 'next/server';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function apiResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(color: string): string {
  switch (color) {
    case 'verde': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'amarillo': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'rojo': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export function getStatusLabel(color: string): string {
  switch (color) {
    case 'verde': return 'A tiempo';
    case 'amarillo': return 'Por vencer';
    case 'rojo': return 'Fuera de tiempo';
    default: return 'Desconocido';
  }
}

export function getEstatusLabel(estatus: string): string {
  switch (estatus) {
    case 'pendiente': return 'Pendiente';
    case 'en_proceso': return 'En Proceso';
    case 'completado': return 'Completado';
    default: return estatus;
  }
}
