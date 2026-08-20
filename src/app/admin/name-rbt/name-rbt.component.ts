import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NameRbt } from 'src/app/models/admin-models/admin-name-rbt.model';
import { NameRbtService } from 'src/app/service/admin-service/admin-namerbt.service';

@Component({
  selector: 'app-name-rbt',
  templateUrl: './name-rbt.component.html',
  styleUrls: ['./name-rbt.component.css']
})
export class NameRbtComponent {
rbtList : NameRbt []=[];

  constructor(private nameRbtService: NameRbtService) {
      this.getNameRbtList();
    }

  // Fetch the list of Name RBTs
  getNameRbtList(): void {
  this.nameRbtService.getNameRbtList().subscribe({
    next: (response: any) => {
      this.rbtList = Array.isArray(response.data) ? response.data : [];
    },
    error: (err: any) => {
      console.error('Failed to fetch RBT list:', err);
      this.rbtList = [];
    }
  });
}

  onAudioUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.rbtList[index].audioFile = file;
      this.rbtList[index].audioUrl = URL.createObjectURL(file);
      this.rbtList[index].hasPreviewed = false;
    }
  }



  playAudio(index: number) {
    const audio = new Audio(this.rbtList[index].audioUrl);
    audio.play();
    audio.onended = () => {
      this.rbtList[index].hasPreviewed = true;
    };
  }

  deleteAudio(index: number) {
    this.rbtList[index].audioFile = null;
    this.rbtList[index].audioUrl = '';
    this.rbtList[index].hasPreviewed = false;
  }

  saveAudio(index: number) {
    if (this.rbtList[index].hasPreviewed) {
      // Backend logic can go here.
    }
  }
}
