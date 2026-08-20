import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private AuthService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
  // const user: User | null = this.AuthService.getLoggedInUser();
  // if (user) {
  //   let targetRoute = '';
  //   switch (user.role) {
  //     case 'ROLE_ADMIN':
  //     case 'ROLE_SUPER_ADMIN':
  //       targetRoute = '/admin/dashboard';
  //       break;
  //     case 'ROLE_CP':
  //       targetRoute = '/cp/dashboard';
  //       break;
  //     case 'ROLE_ARTIST':
  //       targetRoute = '/artist/dashboard';
  //       break;
  //     case 'ROLE_MNO':
  //       targetRoute = '/mno/dashboard';
  //       break;
  //     default:
  //       targetRoute = '/login';
  //   }
  //   if (this.router.url !== targetRoute) {
  //     this.router.navigate([targetRoute]);
  //   }
  // }
  sessionStorage.clear();
  this.AuthService.logout();
    this.router.navigate(['/login']);
}
}
