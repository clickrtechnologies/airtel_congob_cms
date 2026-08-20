import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-otp-modal',
  templateUrl: './otp-modal.component.html',
  styleUrls: ['./otp-modal.component.css']
})
export class OtpModalComponent {
  @Input() title = 'Enter OTP';
  @Input() placeholder = '6-digit OTP';
  @Output() verified = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  visible = false;    // modal visibility
  otp = '';           // bound input value
  isLoading = false;  // show loader
  otpAttempts = 0;    // current attempts
  maxOtpAttempts = 3; // maximum allowed attempts
  message = '';       // feedback message inside modal

  // open modal
  open() {
    this.otp = '';
    this.otpAttempts = 0;
    this.message = '';
    this.visible = true;
  }

  // close modal
  close() {
    this.visible = false;
  }

  // cancel action
  cancel() {
    this.cancelled.emit();
    this.close();
  }

  // called when user clicks Verify
  submit() {
    if (!this.otp || !/^\d{4,6}$/.test(this.otp)) {
      this.message = 'Please enter a valid OTP (4-6 digits).';
      return;
    }


    this.isLoading = true;
    this.message = '';

    // simulate async backend verification (replace with real API call)
    setTimeout(() => {
      this.isLoading = false;

      const isOtpValid = Math.random() > 0.5; // demo logic

      if (isOtpValid) {
        this.verified.emit(this.otp);
        this.close();
      } else {
        this.otpAttempts++;
        const remaining = this.maxOtpAttempts - this.otpAttempts;
        if (remaining > 0) {
          this.message = `Invalid OTP. You have ${remaining} attempt(s) left.`;
        } else {
          this.message = 'You have exceeded maximum OTP attempts.';
        }
      }
    }, 1500);
  }
}
