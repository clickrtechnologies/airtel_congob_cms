import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayoutComponent } from '../layout/user-layout/user-layout/user-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContractsComponent } from './contracts/contracts.component';
import { ApprovalComponent } from './approvals/approvals.component';
import { OperatorComponent } from './operator/operator.component';
const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '',redirectTo: 'dashboard', pathMatch: 'full'  },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'contracts', component: ContractsComponent },
      {path : 'approvals', component : ApprovalComponent},
      {path : 'operators', component : OperatorComponent}
    ]
  },
//   {
//     path: 'admin',
//     component: AdminLayoutComponent, 
//     children: [
//       { path: 'cp-reports', component: ReportsComponent }
//     ]
//   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule  {}
