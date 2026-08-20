import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-token-login',
    template: `<p>Logging in...</p>`
})
export class TokenLoginComponent implements OnInit {
    constructor(private router: Router, private toastr: ToastrService) { }

    ngOnInit() {
        // Tell parent tab we're ready to receive token
        window.opener?.postMessage('readyForToken', window.location.origin);

        // Listen for token from parent
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;

            const data = event.data;
            if (data.accessToken) {
                sessionStorage.setItem('accessToken', data.accessToken);
                sessionStorage.setItem('userRole', data.userRole);
                sessionStorage.setItem('id', data.id);
                sessionStorage.setItem('name', data.name);

                if (data.userRole === 'ROLE_CP') {
                    this.toastr.success('You are now logged in as ' + data.userName);

                    this.router.navigate(['/cp/dashboard']);
                } else if (data.userRole === 'ROLE_ARTIST') {
                    this.router.navigate(['/artist/dashboard']);
                    this.toastr.success('You are now logged in as ' + data.userName);
                } else if (data.userRole === 'ROLE_MNO') {
                    this.toastr.success('You are now logged in as ' + data.userName);
                    this.router.navigate(['/mno/dashboard']);
                }

                else if (data.userRole === 'ROLE_USER') {
                    this.toastr.success('You are now logged in as ' + data.userName);
                    this.router.navigate(['/user/dashboard']);
                }

            }
        });
    }
}
