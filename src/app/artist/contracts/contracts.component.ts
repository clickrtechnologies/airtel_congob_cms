import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ArtistContract } from 'src/app/models/artist-models/artist-contract.model';
import { ArtistContractService } from 'src/app/service/artist-service/artist-contract.service';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css']
})
export class ContractsComponent {

  form = this.fb.group({
      contracts: this.fb.array<FormGroup>([])
    });
  
    get contracts(): FormArray<FormGroup> {
      return this.form.get('contracts') as FormArray<FormGroup>;
    }
    
  contractList: ArtistContract[] = [];

  constructor(private artistContractService: ArtistContractService, private fb: FormBuilder) {
    this.getContractList();
  }

  private createRow(contract?: any): FormGroup {
      return this.fb.group({
        id: new FormControl(contract?.id ?? null),
        artistName: new FormControl(contract?.artistName ?? ''),
        albumName: new FormControl(contract?.albumName ?? ''),
        songName: new FormControl(contract?.songName ?? ''),
        genre: new FormControl(contract?.genre ?? ''),
        cpName: new FormControl(contract?.cpName ?? ''),
        licensedCountry: new FormControl(contract?.licensedCountry ?? ''),
        licensedMNO: new FormControl(contract?.licensedMNO ?? ''),
  
        // store yyyy-MM-dd string (not Date object)
        fromDate: new FormControl(contract?.fromDate ?? ''),
        toDate: new FormControl(contract?.toDate ?? ''),
        expiryDate: new FormControl(contract?.expiryDate ?? ''),
  
        contractFile: new FormControl<File | null>(null),
        contractFileUrl: new FormControl(contract?.contractFileUrl ?? '')
      });
    }


  downloadContract(contract: any): void {
    if (!contract.contractFileUrl) {
      console.error("No contract file available");
      return;
    }

    // Create a hidden <a> element and trigger download
    const link = document.createElement('a');
    link.href = contract.contractFileUrl;
    link.download = contract.contractFileUrl.split('/').pop() || 'contract.pdf'; // fallback name
    link.target = "_blank"; // optional, open in new tab if it's viewable
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }



  getContractList(): void {
    const id = sessionStorage.getItem('id');
    if (!id) {
      console.error('No ID found in sessionStorage');
      return;
    }
    this.artistContractService.getContracts(id).subscribe({
      next: (response: any) => {
        this.contracts.clear();
        
        const list = Array.isArray(response.data) ? response.data : [];
         const filteredSongs = list.filter(
            (item: any) => item.fromDate !== null && item.toDate !== null && item.expiryDate !== null
          );
        filteredSongs.forEach((item: any) => {
          const normalized = {
            id: item.id ?? null,
            artistName: item.artistName ?? '',
            albumName: item.albumName ?? '',
            songName: item.songName ?? '',
            genre: item.genre ?? '',
            cpName: item.cpName ?? '',
            licensedCountry: item.country ?? '',
            licensedMNO: item.mno ?? '',
            fromDate: (item.fromDate ? String(item.fromDate).split('T')[0] : ''),
            toDate: (item.toDate ? String(item.toDate).split('T')[0] : ''),
            expiryDate: (item.expiryDate ? String(item.expiryDate).split('T')[0] : ''),

            contractFileUrl: item.contractFileUrl ?? ''
          };
          const row = this.createRow(normalized);
          this.contracts.push(row);
        });
      },

      error: (err) => {
        console.error('Failed to fetch contract list:', err);
        this.contracts.clear();
      }
    });
  }

  // Method to fetch contracts from the service

}
