import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { PRIMENG_PT } from './core/primeng-pt';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent {
  constructor(primeng: PrimeNGConfig) {
    primeng.setTranslation(PRIMENG_PT);
  }
}
