import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
})
export class SupportComponent {
  supportForm!: FormGroup;
  senderEmail = '';
  toEmail = '';
  companyName = '';
  successMessage = '';
  errorMessage = '';
  private apiUrl = environment.apiUrl + 'contentuploadcontroller/support/send';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private contentUploadService: ContentUploadService
  ) {}

  ngOnInit() {
    // Fetch stored session data
    const cpId = sessionStorage.getItem('id');
    const company = sessionStorage.getItem('company') || 'KRISHI'; // Example logic
    this.senderEmail = sessionStorage.getItem('email') || 'user@example.com';

    // Set company-based "To" email
    this.toEmail =
      company === 'KRISHI'
        ? 'CC@krishil7.com'
        : 'akhildogra@krishil7.com';

    // Auto-fill subject (can be updated dynamically)
    const mno = sessionStorage.getItem('mno') || 'UnknownMNO';
    const geo = sessionStorage.getItem('geo') || 'UnknownGEO';
    const service = sessionStorage.getItem('serviceName') || 'UnknownService';
    const defaultSubject = `${mno}-${geo}-${service}`;

    this.supportForm = this.fb.group({
      subject: [defaultSubject, Validators.required],
      message: ['', Validators.required],
    });
    this.getCpEmailFromApi();
  }

  sendSupportEmail() {
    if (this.supportForm.invalid) return;

    const cpId = sessionStorage.getItem('id');
    if (!cpId) {
      this.errorMessage = 'CP ID not found in session.';
      return;
    }

    const payload = {
      cpId: cpId,
      senderEmail: this.senderEmail,
      toEmail: this.toEmail,
      subject: this.supportForm.value.subject,
      message: this.supportForm.value.message,
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.toastr.success('Support mail sent successfully!');
        this.supportForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to send support mail.');
      },
    });
  }

  getCpEmailFromApi(): void {
  const cpId = sessionStorage.getItem('id');
  if (!cpId) {
    console.error('CP ID not found in sessionStorage.');
    return;
  }

  this.contentUploadService.getCpEmailById(cpId).subscribe({
    next: (res: any) => {
      if (res && res.email) {
        this.senderEmail = res.email;
      } else {
        console.warn('Email not found for this CP ID');
      }
    },
    error: (err: any) => {
    }
  });
}



}
