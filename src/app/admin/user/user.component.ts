import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserLogin } from 'src/app/models/admin-models/user-login.model';
import { UserManagementService } from 'src/app/service/admin-service/user-management.service';

declare var $: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userLogins: UserLogin[] = [];
  newUserForm!: FormGroup;
  selectedUser: any;
  showConfirmBox: boolean = false;

  constructor(
    private userManagementService: UserManagementService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getUserLoginList();
  }

  // Initialize form
  initForm(): void {
    this.newUserForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Fetch existing users
  getUserLoginList(): void {
    this.userManagementService.getUserLogins().subscribe({
      next: (res: any) => {
        this.userLogins = Array.isArray(res.data) ? res.data : [];
      },
      error: (err: any) => {
        console.error('Failed to fetch users:', err);
        this.userLogins = [];
      }
    });
  }

  // Create new user
  createUserLogin(): void {
    if (this.newUserForm.invalid) {
      this.newUserForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.newUserForm.value.name,
      email: this.newUserForm.value.email,
      username: this.newUserForm.value.username,
      password: this.newUserForm.value.password,
      role: 'ROLE_USER'
    };

    // Check for duplicates
    const usernameExists = this.userLogins.some(u => u.username === payload.username);
    const emailExists = this.userLogins.some(u => u.email === payload.email);
    if (usernameExists) return alert('Username already exists');
    if (emailExists) {
      this.newUserForm.get('email')?.setErrors({ emailExists: true });
      return;
    }

    this.userManagementService.createUserLogin(payload).subscribe({
      next: (res: any) => {
        this.userLogins.push(res.data);
        this.newUserForm.reset();
        this.toastr.success('User created successfully');
      },
      error: (err: any) => {
        console.error('Failed to create user:', err);
        this.toastr.error('User creation failed');
      }
    });
  }

  confirmLogin(user: any): void {
    this.selectedUser = user;
    this.showConfirmBox = true;
  }

  // Login as selected user
  userLoginAs(user: any): void {
    this.userManagementService.loginAsUser(user.id).subscribe({
      next: (res: any) => {
        const newTab = window.open('/token-login', '_blank');
        if (!newTab) return;

        const listener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data === 'readyForToken') {
            newTab.postMessage(
              {
                accessToken: res.token,
                userRole: 'ROLE_USER',
                id: res.user.id,
                userName: user.username
              },
              window.location.origin
            );
            window.removeEventListener('message', listener);
          }
          this.showConfirmBox = false;
        };
        window.addEventListener('message', listener);
      },
      error: () => alert('Login failed')
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $('#userTable').DataTable({
        dom: 'Bfrtip',
        paging: true,
        searching: true,
        ordering: true,
        scrollX: true,
        pageLength: 10,
        buttons: ['excelHtml5', 'csvHtml5', 'copy', 'print']
      });
    }, 100);
  }
}
