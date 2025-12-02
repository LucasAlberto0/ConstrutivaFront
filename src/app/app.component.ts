import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
// @ts-ignore
import AOS from 'aos';
import { signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  protected readonly title = signal('GerenciadorDeClientes');

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init();
    }
  }

  shouldShowHeader(): boolean {
    const currentUrl = this.router.url;
    return !currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('/landing-page');
  }

  shouldApplyContainerClass(): boolean {
    const currentUrl = this.router.url;
    return !currentUrl.includes('/login') && !currentUrl.includes('/register') && !currentUrl.includes('/chatbot') && !currentUrl.includes('/landing-page');
  }
}
