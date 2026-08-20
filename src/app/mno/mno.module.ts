import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MnoRoutingModule } from './mno-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApprovalsComponent } from './approvals/approvals.component';
import { ReportsComponent } from './reports/reports.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingComponent } from './setting/setting.component';
import { ProfileComponent } from './profile/profile.component';
import { VerifyTokenMnoComponent } from './verify-token-mno/verify-token-mno.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    DashboardComponent,
    ApprovalsComponent,
    ReportsComponent,
    SettingComponent,
    ProfileComponent,
    VerifyTokenMnoComponent
  ],
  imports: [
    CommonModule,
    MnoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
        TranslateModule

  ]
})
export class MnoModule { }