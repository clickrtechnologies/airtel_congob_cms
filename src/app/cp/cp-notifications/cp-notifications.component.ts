import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast, ToastrService } from 'ngx-toastr';
import { ArtistLogin } from 'src/app/models/admin-models/artist-login.model';
import { CpLogin } from 'src/app/models/admin-models/cp-login.model';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';

// Define the Artist interface
export interface Artist {
  id: number;
  name: string;
  email: string;
  country?: string;
  contactNumber?: string;
   pictureUrl?: string;
   cpId?: number;
   active?: boolean;
}

// Define the CP interface
interface CP {
  to: string;
  cc: string[];
}

@Component({
  selector: 'app-cp-notifications',
  templateUrl: './cp-notifications.component.html',
  styleUrls: ['./cp-notifications.component.css']
})
export class CpNotificationsComponent implements OnInit {


  cpForm: FormGroup;
  artistForm: FormGroup;
  maxCC = 3;

  cpList: CpLogin[] = [];
  artistList: Artist[] = [];

  selectedArtist: Artist | null = null;
  selectedCpId: number | null = null;

  constructor(private fb: FormBuilder, private contentUploadService: ContentUploadService,
    private toastr: ToastrService
  ) {
    this.cpForm = this.fb.group({
      to: ['', [Validators.required, Validators.email]], // required + valid email
      cc: this.fb.array([]) // FormArray for CC emails
    });

    this.artistForm = this.fb.group({
      artistId: [''], // For dropdown selection
      artistName: ['', Validators.required],
      artistEmail: ['', [Validators.required, Validators.email]], // Must be a valid email
      artistCountry: [''],
      artistContact: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$') // 10-digit number only
      ]]
    });


  }

  ngOnInit(): void {
    this.loadCps();
    this.getArtistNames();
  }

  // ---------------- CC Emails ----------------
  get ccEmails(): FormArray {
    return this.cpForm.get('cc') as FormArray;
  }

  addCcEmail(email: string) {
  if (!email) {
    // alert('CC email cannot be empty!');
    this.toastr.warning('CC email cannot be empty!', 'Warning');
    return;
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    // alert('Enter a valid email!');
    this.toastr.warning('Enter a valid email!', 'Warning');
    return;
  }

  if (this.ccEmails.length >= 3) {
    // alert('Maximum 3 CC emails allowed.');
    this.toastr.warning('Maximum 3 CC emails allowed.', 'Warning');
    return;
  }

  // Add CC email as FormControl with Validators
  this.ccEmails.push(this.fb.control(email, [Validators.required, Validators.email]));
}

  removeCcEmail(index: number) {
    this.ccEmails.removeAt(index);
  }

  // ---------------- Load CPs ----------------
  loadCps() {
    this.contentUploadService.getCpLogins().subscribe(res => {
      this.cpList = res;
    });
  }

  selectCp(cpId: number) {
    this.selectedCpId = cpId;
    const cp = this.cpList.find(c => c['id'] === cpId);
    if (cp) {
      this.cpForm.patchValue({ to: cp.email });
      // TODO: load existing CC emails if available
    }
  }

  // ---------------- Artist Selection ----------------
  onArtistSelect(event: Event) {
    const selectedId = +(event.target as HTMLSelectElement).value; // convert to number
    const artist = this.artistList.find(a => a.id === selectedId) || null;

    if (artist) {
      this.artistForm.patchValue({
        artistName: artist.name,
        artistEmail: artist.email,
        artistCountry: artist.country,
        artistContact: artist.contactNumber
      });
    } else {
      // Clear artist fields if default option selected
      this.artistForm.patchValue({
        artistName: '',
        artistEmail: '',
        artistCountry: '',
        artistContact: ''
      });
    }
  }



  // Triggered when artist dropdown changes
  onArtistChange(i: number) {
    // const grp = this.artistForm.at(i); // get FormGroup at index i


    const artistId = +this.artistForm.get('artistId')!.value!; // get selected artistId
    const artist = this.artistList.find(a => a.id === artistId);

    // Update the artistName field in the same FormGroup
    this.artistForm.get('artistName')!.setValue(artist?.name ?? '');
  }

  getArtistNames(): void {
    this.contentUploadService.getArtistNames().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        // normalize to {id, artistName}
        this.artistList = data.map((a: any) => ({
          id: a.id,
          name: a.artistName ?? a.name ?? ''
        }));
      },
      error: (err: any) => {
        this.artistList = [];
      }
    });
  }





  // ---------------- Save CP Emails ----------------
  saveCpEmails() {
    if (this.cpForm.invalid) {
      this.cpForm.markAllAsTouched(); // highlight invalid fields
      // alert('Please fill in all required fields correctly!');
      this.toastr.warning('Please fill in all required fields correctly!', 'Warning');
      return;
    }

    const cpId = sessionStorage.getItem('id');
    const payload = {
      toEmail: this.cpForm.get('to')?.value,
      ccEmail: this.ccEmails.value.filter((email: string) => !!email),
      cpId: cpId
    };

    this.contentUploadService.saveCpEmails(payload).subscribe({
      next: (res: any) => {
        // alert('CP emails saved successfully!');
        this.toastr.success('CP emails saved successfully!', 'Success');
        this.cpForm.reset();
        while (this.ccEmails.length) this.ccEmails.removeAt(0);
      },
      error: (err) => alert(this.toastr.error('Error saving CP emails: ' + (err.error || err.message), 'Error'))
    });
  }




  // ---------------- Save Artist Details ----------------
  saveArtist() {
    const cpId = sessionStorage.getItem('id');
    const artistPayload: Artist = {
      id: 0, // backend id if required
      name: this.artistForm.get('artistName')?.value,
      email: this.artistForm.get('artistEmail')?.value,
      country: this.artistForm.get('artistCountry')?.value,
      contactNumber: this.artistForm.get('artistContact')?.value,
      cpId: cpId ? +cpId : 0 // associate artist with this CP
    };

    this.contentUploadService.saveArtist(artistPayload).subscribe({
      next: () => {
        this.toastr.success('Artist details saved successfully!', 'Success');
        this.artistForm.reset();
        // Update the selected artist in the list
        if (this.selectedArtist) {
          Object.assign(this.selectedArtist, artistPayload);
        }
      },

      error: (err) => this.toastr.error('Error saving artist details: ' + (err.error || err.message), 'Error')
    });

  }

  // ---------------- Edit/Delete CP To ----------------
  editCpTo(value: string) {
    this.cpForm.patchValue({ to: value });
  }

  deleteCpTo() {
    this.cpForm.patchValue({ to: '' });
  }
}
