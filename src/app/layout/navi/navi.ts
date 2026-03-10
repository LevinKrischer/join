import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { Subscription } from '@supabase/supabase-js';

@Component({
  selector: 'app-navi',
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './navi.html',
  styleUrl: './navi.scss',
})
export class Navi implements OnInit, OnDestroy {
  isLoggedIn = signal<boolean>(false);
  private authSubscription?: Subscription;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data } = await this.supabase.getSession();
    this.isLoggedIn.set(!!data.session);

    const {
      data: { subscription },
    } = this.supabase.onAuthStateChange((_event, session) => {
      this.isLoggedIn.set(!!session);
    });

    this.authSubscription = subscription;
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }
}
