import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanLoad, Route, UrlSegment } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private router: Router) {}

  private hasAccess(routePath: string): boolean {
    const role = sessionStorage.getItem('userRole');
    if (!role) return false;
    if (role === 'ROLE_SUPER_ADMIN') return true;
    if (routePath.startsWith('admin') && role === 'ROLE_ADMIN') return true;
    if (routePath.startsWith('cp') && role === 'ROLE_CP') return true;
    if (routePath.startsWith('artist') && role === 'ROLE_ARTIST') return true;
    if (routePath.startsWith('mno') && role === 'ROLE_MNO') return true;
    if (routePath.startsWith('user') && role === 'ROLE_USER') return true;
    return false;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const routePath = route.routeConfig?.path || '';
    if (this.hasAccess(routePath)) {
      return true;
    }
    this.router.navigate(['/home']);
    return false;
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const routePath = route.path || '';
    if (this.hasAccess(routePath)) {
      return true;
    }
    this.router.navigate(['/home']);
    return false;
  }
}