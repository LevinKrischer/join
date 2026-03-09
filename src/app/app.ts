import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss', '../../public/assets/styles/fonts.scss'],
})
export class App {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  protected readonly title = signal('join');


  async ngOnInit() {
    const { data } = await this.supabaseService.getSession();

    if (data.session) {
      this.router.navigate(['/board']);
    } else {
      this.router.navigate(['/help']); // /login
    }
  }

}
