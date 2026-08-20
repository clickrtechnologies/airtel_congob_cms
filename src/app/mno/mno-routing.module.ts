import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MnoLayoutComponent } from '../layout/mno-layout/mno-layout.component';
import { ReportsComponent } from './reports/reports.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { SettingComponent } from './setting/setting.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component : MnoLayoutComponent,
    children: [
      {path : '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path : 'dashboard', component : DashboardComponent},
      {path : 'reports' , component : ReportsComponent},
      {path : 'approvals', component : ApprovalsComponent},
      {path : 'setting', component : SettingComponent},
      {path : 'profile', component : ProfileComponent}
    ]
  } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MnoRoutingModule { }
