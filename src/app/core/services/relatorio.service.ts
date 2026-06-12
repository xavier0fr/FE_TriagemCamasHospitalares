import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  constructor(private http: HttpClient) {}

  downloadRelatorioSemanal(): void {
    this.http.get('/api/relatorio/semanal', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const hoje = new Date().toISOString().slice(0, 10);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_semanal_${hoje}.xml`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => alert('Erro ao gerar relatório XML.')
    });
  }

  downloadXsd(): void {
    this.http.get('/api/relatorio/xsd', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio_semanal.xsd';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => alert('Erro ao descarregar XSD.')
    });
  }
}
