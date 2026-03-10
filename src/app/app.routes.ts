import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { Summary } from './pages/summary/summary';
import { AddTask } from './pages/add-task/add-task';
import { Board } from './pages/board/board';
import { Contacts } from './pages/contacts/contacts';
import { TestComponent } from './pages/test-component/test-component';
import { Help } from './pages/help/help';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: 'summary', component: Summary, canActivate: [authGuard] },
      { path: 'add-task', component: AddTask, canActivate: [authGuard] },
      { path: 'board', component: Board, canActivate: [authGuard] },
      { path: 'contacts', component: Contacts, canActivate: [authGuard] },
      { path: 'privacy-policy', component: PrivacyPolicy },
      { path: 'legal-notice', component: LegalNotice },
      { path: 'help', component: Help, canActivate: [authGuard] },
      { path: 'test', component: TestComponent },
    ],
  },
  { path: '**', redirectTo: 'summary' },
];
