import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../user/dashboard/dashboard.component';
import { ContractsComponent } from './contracts/contracts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { ApprovalComponent } from './approvals/approvals.component';
import { UserRoutingModule } from './user-routing.module';
import { OperatorComponent } from './operator/operator.component';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    DashboardComponent,
    ContractsComponent,
    ApprovalComponent,
    OperatorComponent
  ],
  imports: [
    CommonModule,  
    FormsModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatIconModule,
    UserRoutingModule,
    TranslateModule
  ]
})
export class UserModule {}
