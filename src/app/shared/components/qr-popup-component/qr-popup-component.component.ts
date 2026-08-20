import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-qr-popup',
  template: `<div class="p-4 text-center">
               <img [src]="data.url" alt="QR" width="250">
             </div>`
})
export class QrPopupComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {}
}
