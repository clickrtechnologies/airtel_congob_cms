import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  artist = {
    cpName: 'Sample CP',
    artistName: 'Artist Example',
    artistEmail: 'artist@example.com',
    username: 'artistuser',
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
      this.artist = parsedUser;
    }
  }

  saveChanges() {
    this.editMode = false;
    sessionStorage.setItem('loggedInUser', JSON.stringify(this.artist));
    alert('Artist Profile updated successfully');
  }
}
