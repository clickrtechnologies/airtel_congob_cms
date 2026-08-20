import { Component, AfterViewInit } from '@angular/core';
import { ArtistSong } from 'src/app/models/artist-models/artist-song.model';
import { ArtistDashboardService } from 'src/app/service/artist-service/artist-dashboard.service';
import { ApprovalsComponent } from '../approvals/approvals.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ArtistApproval } from 'src/app/models/artist-models/artist-approval.model';
import { ApprovalService } from 'src/app/service/artist-service/artist-approval.service';
import { QrPopupComponent } from 'src/app/shared/components/qr-popup-component/qr-popup-component.component';
import { MatDialog } from '@angular/material/dialog';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {


  songs: ArtistSong[] = [];

  constructor(private artistDashboardService: ArtistDashboardService, 
    private approvalService: ApprovalService, private fb: FormBuilder,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    const artistId = Number(sessionStorage.getItem('id'));
    if (artistId) {
      this.getArtistSongContent(artistId);
    }
    this.getArtistLoginList();
    this.getMnoLoginList();
  }

  // Fetch songs from the service
  getSongList(): void {
    this.artistDashboardService.getArtistDashboardSongs().subscribe({
      next: (response: any) => {
        this.songs = Array.isArray(response.data) ? response.data : [];
      },
      error: (err) => {
        console.error('Failed to fetch songs:', err);
        this.songs = [];
      }
    });
  }

  approvals: (any & { controls: FormGroup })[] = [];
  artistList: any;
  mnoLogins: any;



  // Fetch songs for this artist ( approved only)
  getArtistSongContent(artistId: number): void {
    this.approvalService.getArtistContent(artistId).subscribe({
      next: (response: any) => {

        if (Array.isArray(response.data)) {

          // Only keep songs approved by the artist
          const approvedSongs = response.data.filter((item: any) => item.approvedByArtist != null &&item.active === true);
          // Only keep songs not approved AND inactive
          


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


 openQrPopup(url: string) {
    this.dialog.open(QrPopupComponent, {
      data: { url },
      width: '300px',          // dialog width
      maxHeight: '80vh',       // optional
      panelClass: 'custom-qr-dialog' // optional custom styling
    });
  }



}
