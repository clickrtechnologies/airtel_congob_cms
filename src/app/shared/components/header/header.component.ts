import { AuthService } from './../../../auth/auth.service';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/models/user.model';
import { NotificationService } from 'src/app/service/notification.service';
import { Notification } from 'src/app/models/notification.model';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'translateY(-5px)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-5px)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  isLoggedIn = false;
  userImage = 'https://ui-avatars.com/api/?background=random&name=User';

  showNotifications = false;
  notifications: Notification[] = [];
  notificationCount = 0;
  roleRoute: string | null | undefined;

    selectedLanguage = 'en';

  constructor(
    private AuthService: AuthService,
    private router: Router,
    private http: HttpClient,
    private notificationService: NotificationService,
    private toastr: ToastrService,
    private eRef: ElementRef,
    private translate: TranslateService

  ) {
    this.translate.addLangs(['en', 'fr']);

    const savedLang = localStorage.getItem('appLanguage') || 'en';
    this.selectedLanguage = savedLang;
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }
  changeLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('appLanguage', lang);

  }
  

  ngOnInit() {
    const userRole = sessionStorage.getItem('userRole');
    
  if (userRole) {
    this.isLoggedIn = true;

    // Map backend roles (ROLE_*) to frontend routes
    const roleMap: { [key: string]: string } = {
      ROLE_ADMIN: 'admin',
      ROLE_CP: 'cp',
      ROLE_MNO: 'mno',
      ROLE_ARTIST: 'artist',
      ROLE_USER: 'user'
    };

    this.roleRoute = roleMap[userRole] || null;
  }
    this.user = this.AuthService.getLoggedInUser();
    this.isLoggedIn = this.AuthService.isLoggedIn();

    if (this.user) {
      this.userImage = `https://ui-avatars.com/api/?background=random&name=${this.user.role}`;
    }

    if (sessionStorage.getItem('userRole') === 'ROLE_ADMIN' || sessionStorage.getItem('userRole') === 'ROLE_CP') {
      this.loadNotifications();
    }
  }


   toggleNotifications() {
  this.showNotifications = !this.showNotifications;

}
navigateToDashboard(): void {
    const role = sessionStorage.getItem('userRole');

    if (role) {
      const roleRoute = role.replace('ROLE_', '').toLowerCase();
      const target = `/${roleRoute}/dashboard`;


      if (this.router.url === target) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([target]);
        });
      } else {
        this.router.navigate([target]);
      }
    } else {
      console.warn('⚠️ No role found in sessionStorage, cannot navigate.');
    }
  }




   // Load notifications only for the current role
  loadNotifications() {
  const id = sessionStorage.getItem('id'); // "ROLE_CP" or "ROLE_ADMIN"
  const userRole = sessionStorage.getItem('userRole');
  if (!id) return;

  this.notificationService.getNotifications(id).subscribe({
    next: (res: any) => {
      const data = res.data || []; // unwrap the array

      this.notifications = data.map((n: any) => ({
        id: n.id ?? 0,
        message: n.message ?? '',
        type: n.type ?? '',
        songContentId: n.songContentId ?? null,
        userType: n.userType ?? '',
        seen: n.seen ?? false,
        createdAt: n.createdAt ?? '',
      }));

      // Count unseen notifications only for this role
      this.notificationCount = this.notifications.filter(n => !n.seen && n.userType == userRole).length;
      this.notifications = this.notifications.filter(n => !n.seen && n.userType == userRole);
      
    },
    error: (err) => console.error("Error fetching notifications", err)
  });
}

async onNotificationClick(note: any) {
    const userType = sessionStorage.getItem('userRole'); // "ROLE_CP" or "ROLE_ADMIN"
    if (!userType) return;
    // Mark as seen
    if (!note.seen) {
      await this.notificationService.markAsSeen(note.id).subscribe(() => {
        note.seen = true;
        this.notificationCount = this.notifications.filter(n => !n.seen).length;
        this.loadNotifications();
      });
    }
    

    // Close dropdown
    this.showNotifications = false;

    // Redirect based on role
    if (userType === 'ROLE_ADMIN') {
      this.router.navigate(['admin/dashboard']);
    } 
    if (userType === 'ROLE_CP'){
      this.router.navigate(['cp/contracts']);
    }
  }



confirmNavigation(targetRoute: string): void {
    if(this.isLoggedIn === false){
      this.router.navigate([targetRoute]);
      return;
    }

    Swal.fire({
      title: this.translate.instant('Are you sure?'),
    text: this.translate.instant('You will be logged out if you continue.'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: this.translate.instant('Yes, continue'),
    cancelButtonText: this.translate.instant('Cancel'),
      reverseButtons: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.logoutAndNavigate(targetRoute);
      } else {
      }
    });
  }

  logoutAndNavigate(route: string): void {
    // Clear session or local storage
    sessionStorage.clear();
    localStorage.clear();
    this.toastr.success('  Logged out successfully');

    // Small delay for UX smoothness
    setTimeout(() => {
      this.router.navigate([route]);
    }, 500);
  }


  logout() {
    this.AuthService.logout();
    this.router.navigate(['/home']);
  }

   /**  Detect click outside dropdown and close it */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.showNotifications && !this.eRef.nativeElement.contains(event.target)) {
      this.showNotifications = false;
    }
  }
}
