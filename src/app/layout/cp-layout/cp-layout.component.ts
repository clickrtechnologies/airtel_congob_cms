import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cp-layout',
  templateUrl: './cp-layout.component.html',
  styleUrls: ['./cp-layout.component.css']
})
export class CpLayoutComponent {
  isSidebarHidden = false;

toggleSidebar() {
  this.isSidebarHidden = !this.isSidebarHidden;
}
  constructor(private router: Router) {}
  ngOnInit(): void {
    if (!sessionStorage.getItem('userRole')) {
      this.router.navigate(['/home']);
    }
  }
}
