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
import { Register } from './pages/register/register';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'summary', pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'summary', component: Summary },
      { path: 'add-task', component: AddTask },
      { path: 'board', component: Board },
      { path: 'contacts', component: Contacts },
      { path: 'privacy-policy', component: PrivacyPolicy },
      { path: 'legal-notice', component: LegalNotice },
      { path: 'help', component: Help },
      { path: 'test', component: TestComponent },
    ],
  },
];
