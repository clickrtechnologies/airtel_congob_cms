import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.css']
})
export class LoginPopupComponent {
  @Input() showConfirmBox = false;
  @Input() cpData: any;

  @Output() cancelEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<void>();

  cancel() { this.cancelEvent.emit(); }
  confirmLogin() { this.confirmEvent.emit(); }
}
