import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  mno = {
    telcoName: 'Airtel',
    personnelName: 'MNO User',
    personnelEmail: 'mno@example.com',
    username: 'mnouser',
    password: '******'
  };

  editMode = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (!storedUser) {
      this.router.navigate(['/']);
    } else {
      const parsedUser = JSON.parse(storedUser);
      this.mno = parsedUser;
    }
  }

  saveChanges() {
    this.editMode = false;
    sessionStorage.setItem('loggedInUser', JSON.stringify(this.mno));
    alert('MNO Profile updated successfully');
  }
}
