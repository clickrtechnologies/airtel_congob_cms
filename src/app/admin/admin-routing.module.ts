import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ArtistManagementComponent } from './artist-management/artist-management.component';
import { CpManagementComponent } from './cp-management/cp-management.component';
import { MnoManagementComponent } from './mno-management/mno-management.component';
import { UserComponent } from './user/user.component';
import { NameRbtComponent } from './name-rbt/name-rbt.component';
import { SettingComponent } from './setting/setting.component';
import { ProfileComponent } from './profile/profile.component';
import { TokenLoginComponent } from './token-login.component';
import { MisReportComponent } from './mis-report/mis-report.component';
import { InternalMisReportComponent } from './internal-mis-report/internal-mis-report.component';
import { ContentDownloadDailyReportComponent } from './content-download-daily-report/content-download-daily-report.component';
import { ContentDownloadMonthlyReportComponent } from './content-download-monthly-report/content-download-monthly-report.component';
import { InboxComponent } from './inbox/inbox.component';
import { BulkDownloadComponent } from './bulk-download/bulk-download.component';
import { AdminApprovalComponent } from './admin-approval/admin-approval.component';
import { ThumbnailUploadComponent } from './thumbnail-upload/thumbnail-upload.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'inbox', component: InboxComponent },
      { path: 'artist-management', component: ArtistManagementComponent },
      { path: 'cp-management', component: CpManagementComponent },
      { path: 'mno-management', component: MnoManagementComponent },
      { path: 'user-management', component: UserComponent },
      { path: 'name-rbt', component: NameRbtComponent },
      { path: 'setting', component: SettingComponent },
      { path: 'profile', component: ProfileComponent },
      {path: 'mis-reports', component: MisReportComponent},
      {path: 'internal-mis-reports',component: InternalMisReportComponent},
      {path: 'content-download-daily-report', component: ContentDownloadDailyReportComponent},  
      {path: 'content-download-monthly-report', component: ContentDownloadMonthlyReportComponent},  
      {path: 'bulk-download', component: BulkDownloadComponent},  
      {path: 'thumbnail-upload', component: ThumbnailUploadComponent},
      {
        path: 'token-login',
        component: TokenLoginComponent
      },
      {
        path: 'admin-approval',
        component: AdminApprovalComponent
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
