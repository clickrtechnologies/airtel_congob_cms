import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Rbt } from 'src/app/models/cp-models/rbt.model';
import { RbtService } from 'src/app/service/cp-service/rbt.service';

@Component({
  selector: 'app-name-rbt',
  templateUrl: './name-rbt.component.html',
  styleUrls: ['./name-rbt.component.css']
})
export class NameRbtComponent {

  // rbtList = [
  //   {
  //     msisdn: '9876543210',
  //     name: 'Welcome Tune',
  //     audioFile: null as File | null,
  //     audioUrl: '',
  //     hasPreviewed: false,
  //     code: 'RBT1234'
  //   }
  // ];

  rbtList : Rbt[] = []
  constructor(private rbtService: RbtService) {
    this.getRbtList();
  }

  getRbtList(): void {
  this.rbtService.getRbtList().subscribe({
    next: (response: any) => {
      this.rbtList = Array.isArray(response.data) ? response.data : [];
    },
    error: (err) => {
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
      alert('Audio saved for Name RBT!');
      // Backend logic can go here.
    }
  }
}
