import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpRoutingModule } from './cp-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContentUploadComponent } from './content-upload/content-upload.component';
import { NameRbtComponent } from './name-rbt/name-rbt.component';
import { ReportsComponent } from './reports/reports.component';
import { ContractsComponent } from './contracts/contracts.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingComponent } from './setting/setting.component';
import { CpNotificationsComponent } from './cp-notifications/cp-notifications.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from "@angular/material/core";
import { ArtistDetailsComponent } from './artist-details/artist-details.component';
import { SupportComponent } from './support/support.component';
import { OtpModalComponent } from '../shared/components/otp-modal/otp-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BulkDownloadComponent } from './bulk-download/bulk-download.component';
@NgModule({
  declarations: [
    DashboardComponent,
    ContentUploadComponent,
    NameRbtComponent,
    ReportsComponent,
    ContractsComponent,
    ProfileComponent,
    SettingComponent,
    CpNotificationsComponent,
    ArtistDetailsComponent,
    SupportComponent,
    OtpModalComponent,
    BulkDownloadComponent   
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CpRoutingModule,

    // Angular Material
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule,
    TranslateModule,
    MatProgressBarModule   
  ]
})
export class CpModule {}
