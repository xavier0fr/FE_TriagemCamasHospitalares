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
