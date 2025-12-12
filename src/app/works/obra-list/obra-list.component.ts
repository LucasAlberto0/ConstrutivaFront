import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ObraService } from '../../shared/obra.service';
import { ObraListagemDto, ObraStatus } from '../../shared/models/obra.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-obra-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './obra-list.component.html',
  styleUrls: ['./obra-list.component.scss']
})
export class ObraListComponent implements OnInit {
  obras: ObraListagemDto[] = [];
  filteredObras: ObraListagemDto[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentFilter: string = 'Todas';
  searchTerm: string = ''; 

  constructor(private obraService: ObraService) { }

  ngOnInit(): void {
    this.loadObras();
  }

  loadObras(): void {
    this.loading = true;
    this.obraService.getObras().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.data)) {
          this.obras = response.data;
          this.filteredObras = [...this.obras];
          this.applySearchFilter(); 
        } else {
          this.obras = [];
          this.filteredObras = [];
          this.error = 'Failed to load works: Invalid data format.';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load works.';
        this.loading = false;
      }
    });
  }

  filterObras(filter: string): void {
    this.currentFilter = filter;
    this.applySearchFilter(); 
  }

  applySearchFilter(): void {
    let tempObras = [...this.obras];

    if (this.currentFilter !== 'Todas') {
      tempObras = tempObras.filter(obra => this.getStatusName(obra.status) === this.currentFilter);
    }

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempObras = tempObras.filter(obra =>
        obra.nome?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredObras = tempObras;
  }

  getStatusName(status: ObraStatus | undefined): string {
    switch (status) {
      case ObraStatus.EmAndamento: return 'Em Andamento';
      case ObraStatus.EmManutencao: return 'Em Manutenção';
      case ObraStatus.Suspensa: return 'Suspensa';
      case ObraStatus.Finalizada: return 'Finalizada';
      default: return 'Desconhecido';
    }
  }

  getStatusClass(status: ObraStatus | undefined): string {
    switch (status) {
      case ObraStatus.EmAndamento: return 'status-andamento';
      case ObraStatus.EmManutencao: return 'status-manutencao';
      case ObraStatus.Suspensa: return 'status-suspensa';
      case ObraStatus.Finalizada: return 'status-finalizada';
      default: return '';
    }
  }
}