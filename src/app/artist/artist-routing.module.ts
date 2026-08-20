import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistLayoutComponent } from '../layout/artist-layout/artist-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { ReportsComponent } from './reports/reports.component';
import { ContractsComponent } from './contracts/contracts.component';
import { AdminLayoutComponent } from '../layout/admin-layout/admin-layout.component';
import { SettingComponent } from './setting/setting.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: ArtistLayoutComponent,
    children : [
      {path : '',redirectTo: 'dashboard', pathMatch: 'full'},
      {path : 'dashboard', component:DashboardComponent},
      {path : 'approvals', component : ApprovalsComponent},
      {path : 'reports', component : ReportsComponent},
      {path : 'contracts', component : ContractsComponent},
      {path : 'setting', component : SettingComponent},
      {path : 'profile', component : ProfileComponent}
    
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent, 
    children: [
      { path: 'artist-reports', component: ReportsComponent }
    ]
  }

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtistRoutingModule { }
