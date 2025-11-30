import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { DashboardService } from '../shared/dashboard.service';
import { DashboardSummaryDto } from '../shared/models/dashboard.model';
import { AuthService } from '../shared/auth.service';
import { UserInfo } from '../shared/models/user.model';
import { environment } from '../../environments/environment'; // Import environment

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  dashboardSummary: DashboardSummaryDto | null = null;
  userInfo: UserInfo | null = null;
  loading: boolean = true;
  error: string | null = null;
  statusChart: any = null;
  uploadingPicture: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getDashboardSummary();
    this.getUserInfo();
  }

  ngAfterViewInit(): void {
    this.createStatusChart();
  }

  private _getProfilePictureFullUrl(relativeUrl: string | undefined): string | undefined {
    if (!relativeUrl) {
      return undefined;
    }
    // Ensure the base URL doesn't end with a slash and the relative URL starts with one
    const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
    const cleanRelativeUrl = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
    return `${baseUrl}${cleanRelativeUrl}`;
  }

  getUserInfo(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.userInfo = user;
        if (this.userInfo.profilePictureUrl) {
          this.userInfo.profilePictureUrl = this._getProfilePictureFullUrl(this.userInfo.profilePictureUrl);
        }
      },
      error: (err) => {
        console.error('Failed to load user info:', err);
      }
    });
  }

  onProfilePictureSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.uploadingPicture = true;
      this.authService.uploadProfilePicture(file).subscribe({
        next: (response) => {
          // Backend now returns a message, not the URL.
          // We need to force a refresh of the image by busting the cache.
          if (this.userInfo && this.userInfo.profilePictureUrl) {
            // Remove any existing timestamp to avoid multiple timestamps
            let cleanUrl = this.userInfo.profilePictureUrl.split('?')[0];
            this.userInfo.profilePictureUrl = `${cleanUrl}?timestamp=${new Date().getTime()}`;
          } else if (this.userInfo) {
            // If there was no profile picture before, we need to re-fetch user info
            // to get the new relative URL from the backend.
            this.getUserInfo();
          }
          this.uploadingPicture = false;
        },
        error: (err) => {
          console.error('Failed to upload profile picture:', err);
          this.uploadingPicture = false;
          // Optionally: show an error message to the user
        }
      });
    }
  }

  getDashboardSummary(): void {
    this.loading = true;
    this.dashboardService.getDashboardSummary().subscribe({
      next: (summary) => {
        this.dashboardSummary = summary;
        this.loading = false;
        this.createStatusChart(); 
      },
      error: (err) => {
        this.error = 'Failed to load dashboard summary.';
        this.loading = false;
        console.error('Dashboard summary error:', err);
      }
    });
  }

  createStatusChart(): void {
    if (this.dashboardSummary && !this.statusChart) {
      const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
      if (canvas) {
        this.statusChart = new Chart(canvas, {
          type: 'pie',
          data: {
            labels: ['Em Andamento', 'Em Manutenção', 'Suspensas', 'Finalizadas'],
            datasets: [{
              label: 'Status das Obras',
              data: [
                this.dashboardSummary.obrasEmAndamento || 0,
                this.dashboardSummary.obrasEmManutencao || 0,
                this.dashboardSummary.obrasSuspensas || 0,
                this.dashboardSummary.obrasFinalizadas || 0
              ],
              backgroundColor: [
                '#2463EA',
                '#F59E0B',
                '#EF4444',
                '#10B981'
              ]
            }]
          }
        });
      }
    }
  }

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