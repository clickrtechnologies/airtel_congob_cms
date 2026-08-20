import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  constructor(private router: Router) { }
  ngOnInit(): void {
    if (!sessionStorage.getItem('userRole')) {
      this.router.navigate(['/home']);
    }
  }
isSidebarHidden = false;

toggleSidebar() {
  this.isSidebarHidden = !this.isSidebarHidden;
}
  // Example in your sidebar component
  toggleSubmenu(event: Event) {
    const parent = (event.currentTarget as HTMLElement).parentElement;
    if (parent) {
      parent.classList.toggle('open');
    }
  }

}
