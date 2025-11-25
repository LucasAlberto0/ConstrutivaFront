import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import RouterLink
import { DashboardService } from '../shared/dashboard.service';
import { DashboardSummaryDto } from '../shared/models/dashboard.model';
import { ObraListagemDto } from '../shared/models/obra.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink to imports
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardSummary: DashboardSummaryDto | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.getDashboardSummary();
  }

  getDashboardSummary(): void {
    this.loading = true;
    this.dashboardService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.dashboardSummary = summary;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard summary.';
        this.loading = false;
        console.error('Dashboard summary error:', err);
      }
    });
  }

  // Helper to get status name
  getStatusName(status: number | undefined): string {
    switch (status) {
      case 0: return 'Em Andamento';
      case 1: return 'Em Manutenção';
      case 2: return 'Suspensa';
      case 3: return 'Finalizada';
      default: return 'Desconhecido';
    }
  }

  getStatusClass(status: number | undefined): string {
    switch (status) {
      case 0: return 'status-andamento';
      case 1: return 'status-manutencao';
      case 2: return 'status-suspensa';
      case 3: return 'status-finalizada';
      default: return '';
    }
  }
}