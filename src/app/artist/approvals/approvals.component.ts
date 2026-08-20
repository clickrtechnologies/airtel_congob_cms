import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ArtistApproval } from 'src/app/models/artist-models/artist-approval.model';
import { ApprovalService } from 'src/app/service/artist-service/artist-approval.service';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent implements OnInit {

  approvals: (ArtistApproval & { controls: FormGroup })[] = [];
  artistList: any;
  mnoLogins: any;
  isPlaying: boolean[] = [];
  isLoading = false;

  constructor(private approvalService: ApprovalService, private fb: FormBuilder, private toastr: ToastrService) { }

  ngOnInit(): void {
    const artistId = Number(sessionStorage.getItem('id'));
    if (artistId) {
      this.getArtistSongContent(artistId);
    }
    this.getArtistLoginList();
    this.getMnoLoginList();
  }

  // Fetch songs for this artist (un approved only)
  getArtistSongContent(artistId: number): void {
    this.approvalService.getArtistContent(artistId).subscribe({
      next: (response: any) => {

        if (Array.isArray(response.data)) {

          //  Only keep songs not approved by the artist
          // const approvedSongs = response.data.filter((item: any) => item.approvedByArtist === null);
          // Only keep songs not approved AND inactive
          const approvedSongs = response.data.filter(
            (item: any) => item.approvedByArtist === null && item.active === true && item.approvedByUser === true
          );


          this.approvals = approvedSongs.map((item: any) => {
            const song = {
              id: item.id || null,
              artist: item.artist?.name || item.artistName || '',
              album: item.albumName || '',
              songName: item.songName || '',
              genre: item.genre || '',
              uploadDate: item.uploadDate?.split("T")[0] || '',
              cp: item.cpName || '',
              fromDate: item.fromDate?.split("T")[0] || '',
              toDate: item.toDate?.split("T")[0] || '',
              country: item.country || '',
              mno: item.mnoName || item.mno || '',
              approved: item.approvedByArtist ?? null,
              songCode: item.songCode || '',
              qrUrl: item.qrCodeUrl || '',
              licensedCountry: item.licensedCountry || '',
              active: item.active || '',
              audioFileUrl: item.audioFileUrl || ''
            };

            return {
              ...song,
              controls: this.fb.group({
                approved: new FormControl(song.approved)
              })
            };
          });
        } else {
          this.approvals = [];
        }
      },
      error: () => {
        this.approvals = [];
      }
    });
  }


  getArtistLoginList(): void {
    this.approvalService.getArtistLogins().subscribe({
      next: (response: any) => {
        this.artistList = Array.isArray(response.data) ? response.data : [];
      },
      error: (err: any) => {
        console.error('Failed to fetch artist logins:', err);
        this.artistList = [];
      }
    });
  }


  getMnoLoginList(): void {
    this.approvalService.getMnoLogins().subscribe({
      next: (response: any) => {
        this.mnoLogins = Array.isArray(response.data) ? response.data : [];
      },
      error: (err: any) => {
        console.error('Failed to fetch MNO logins:', err);
        this.mnoLogins = [];
      }
    });
  }



  // Save approval
  saveApproval(index: number): void {
    const song = this.approvals[index];
    const approved = song.controls?.get('approved')?.value;

    const requestDTO = {
      id: song.id,
      approvedByArtist: approved
    };

    this.approvalService.approveSong(requestDTO).subscribe({
      next: () => {
        this.toastr.success('Approval saved successfully!');
        song.approved = approved; // update local value
        this.getArtistSongContent(Number(sessionStorage.getItem('id'))); // refresh the list
      },
      error: (err: any) => {
        console.error('Failed to save approval', err);
        this.toastr.error('Failed to save approval. Please try again.');
      }
    });
  }

  saveAllApprovals(): void {
    const bulkRequest = this.approvals.map(song => ({
      id: song.id,
      approvedByArtist: song.approved
    }));

    this.isLoading = true; // show loader

    this.approvalService.approveSongsBulk(bulkRequest).subscribe({
      next: () => {
        this.toastr.success('Selected approvals saved successfully!');
        this.getArtistSongContent(Number(sessionStorage.getItem('id')));
        this.isLoading = false; // hide loader
      },
      error: (err) => {
        console.error('Failed to save approvals', err);
        this.toastr.error('Failed to save approvals. Please try again.');
        this.isLoading = false; // hide loader
      }
    });
  }

  playAudio(i: number) {
    const audio = document.getElementById(`audio-player-${i}`) as HTMLAudioElement | null;
    if (audio) {
      audio.play();
    }
  }

  pauseAudio(i: number) {
    const audio = document.getElementById(`audio-player-${i}`) as HTMLAudioElement | null;
    if (audio) {
      audio.pause();
    }
  }

  toggleAudio(i: number) {
    const audio = document.getElementById(`audio-player-${i}`) as HTMLAudioElement | null;

    if (audio) {
      if (this.isPlaying[i]) {
        audio.pause();
        this.isPlaying[i] = false;
      } else {
        // Pause all other audios first
        this.isPlaying.forEach((_, index) => {
          const otherAudio = document.getElementById(`audio-player-${index}`) as HTMLAudioElement | null;
          if (otherAudio) otherAudio.pause();
          this.isPlaying[index] = false;
        });

        audio.play();
        this.isPlaying[i] = true;

        // Reset when audio ends
        audio.onended = () => {
          this.isPlaying[i] = false;
        };
      }
    }
  }

  get selectAllChecked(): boolean {
    return this.approvals.every(song => song.approved === true);
  }

  get selectAllLabel(): string {
    return this.selectAllChecked ? 'Reject All' : 'Approve All';
  }

  selectAllToggle(event: any) {
    const toggle = !this.selectAllChecked;
    this.approvals.forEach(song => song.approved = toggle);
  }




}
