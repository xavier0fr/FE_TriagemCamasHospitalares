import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  constructor(private http: HttpClient) {}

  // ── Relatório semanal de limpezas (auxiliares) ──────────────
  downloadRelatorioSemanal(): void {
    this.http.get('/api/relatorio/semanal', { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, `relatorio_semanal_${this._hoje()}.xml`),
      error: () => alert('Erro ao gerar relatório XML.')
    });
  }

  downloadXsd(): void {
    this.http.get('/api/relatorio/xsd', { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, 'relatorio_semanal.xsd'),
      error: () => alert('Erro ao descarregar XSD.')
    });
  }

  // ── Exportação / Importação de doentes (medicalExport) ──────
  exportarDoentes(): void {
    this.http.get('/api/doentes/export.xml', { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, `doentes_${this._hoje()}.xml`),
      error: () => alert('Erro ao exportar doentes em XML.')
    });
  }

  exportarXsdDoentes(): void {
    this.http.get('/api/doentes/export.xsd', { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, 'medical-export.xsd'),
      error: () => alert('Erro ao descarregar XSD.')
    });
  }

  importarDoentes(xmlText: string): Observable<any> {
    return this.http.post('/api/doentes/import.xml', xmlText, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  // ── Exportação de estado das camas ──────────────────────────
  exportarCamas(andarId?: string, quartoId?: string): void {
    const params: string[] = [];
    if (andarId) params.push(`andar_id=${encodeURIComponent(andarId)}`);
    if (quartoId) params.push(`quarto_id=${encodeURIComponent(quartoId)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    this.http.get(`/api/camas/export.xml${qs}`, { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, `estado_camas_${this._hoje()}.xml`),
      error: () => alert('Erro ao exportar estado das camas em XML.')
    });
  }

  exportarXsdCamas(): void {
    this.http.get('/api/camas/export.xsd', { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, 'estado_camas.xsd'),
      error: () => alert('Erro ao descarregar XSD das camas.')
    });
  }

  importarCamas(xmlText: string): Observable<any> {
    return this.http.post('/api/camas/import.xml', xmlText, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  // ── Exportação de internamentos ─────────────────────────────
  exportarInternamentos(): void {
    this.http.get('/api/internamentos/export.xml', { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, `internamentos_${this._hoje()}.xml`),
      error: () => alert('Erro ao exportar internamentos em XML.')
    });
  }

  exportarXsdInternamentos(): void {
    this.http.get('/api/internamentos/export.xsd', { responseType: 'blob' }).subscribe({
      next: (blob) => this._download(blob, 'internamentos.xsd'),
      error: () => alert('Erro ao descarregar XSD dos internamentos.')
    });
  }

  importarInternamentos(xmlText: string): Observable<any> {
    return this.http.post('/api/internamentos/import.xml', xmlText, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────
  private _download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private _hoje(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
