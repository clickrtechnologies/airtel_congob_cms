import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { ArtistManagementComponent } from './artist-management/artist-management.component';
import { CpManagementComponent } from './cp-management/cp-management.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MnoManagementComponent } from './mno-management/mno-management.component';
import { UserComponent } from './user/user.component';
import { NameRbtComponent } from './name-rbt/name-rbt.component';
import { SettingComponent } from './setting/setting.component';
import { ProfileComponent } from './profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { LoginPopupComponent } from '../shared/components/login-popup/login-popup.component';
import { MisReportComponent } from './mis-report/mis-report.component';
import { InternalMisReportComponent } from './internal-mis-report/internal-mis-report.component';
import { ContentDownloadDailyReportComponent } from './content-download-daily-report/content-download-daily-report.component';
import { ContentDownloadMonthlyReportComponent } from './content-download-monthly-report/content-download-monthly-report.component';
import { InboxComponent } from './inbox/inbox.component';
import { TranslateModule } from '@ngx-translate/core';
import { BulkDownloadComponent } from './bulk-download/bulk-download.component';
import { AdminApprovalComponent } from './admin-approval/admin-approval.component';
import { ThumbnailUploadComponent } from './thumbnail-upload/thumbnail-upload.component';
@NgModule({
  declarations: [
    ArtistManagementComponent,
    CpManagementComponent,
    DashboardComponent,
    MnoManagementComponent,
    UserComponent,
    NameRbtComponent,
    SettingComponent,
    ProfileComponent,
    LoginPopupComponent,
    MisReportComponent,
    InternalMisReportComponent,
    ContentDownloadDailyReportComponent,
    ContentDownloadMonthlyReportComponent,
    InboxComponent,
    BulkDownloadComponent,
    AdminApprovalComponent,
    ThumbnailUploadComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    TranslateModule
]
})
export class AdminModule { }
