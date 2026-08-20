import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
    isSidebarHidden = false;

toggleSidebar() {
  this.isSidebarHidden = !this.isSidebarHidden;
}
  constructor(private router: Router) {}
  ngOnInit(): void {
    // if (!sessionStorage.getItem('userRole')) {
    //   this.router.navigate(['/home']);
    // };
  }

}
