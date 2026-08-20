import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user = {
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: '******'
  };

  editMode = false;

  saveChanges() {
    this.editMode = false;
    sessionStorage.setItem('userProfile', JSON.stringify(this.user));
    alert('Profile updated successfully');
  }
}
