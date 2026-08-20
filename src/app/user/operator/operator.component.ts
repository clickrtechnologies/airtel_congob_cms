import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Operator, OperatorService } from 'src/app/service/user-service/operator.service';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css']
})
export class OperatorComponent implements OnInit {

  operators: Operator[] = [];
  isLoading = false;
  editingOperatorId: number | null = null;
  editForm: FormGroup;
  addOperatorForm: FormGroup;
  formSubmitting = false;

  constructor(private operatorService: OperatorService, private fb: FormBuilder) {
    // Inline edit form
    this.editForm = this.fb.group({
      operatorName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      countryCode: ['', Validators.required],
      companyLogo: ['']
    });

    // Add Operator form
    this.addOperatorForm = this.fb.group({
      operatorName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      countryCode: ['', Validators.required],
      password: ['', Validators.required],
      companyLogo: [''] // will hold backend URL, not base64
    });
  }

  ngOnInit(): void {
    this.fetchOperators();
  }

  fetchOperators(): void {
    this.isLoading = true;
    this.operatorService.getOperators().subscribe({
      next: (res: Operator[]) => {
        this.operators = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching operators', err);
        this.isLoading = false;
      }
    });
  }

  // Handle File Upload
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.operatorService.uploadCompanyLogo(file).subscribe({
      next: (res: any) => {
        if (res.imageUrl) {
          // Set backend image URL in form
          this.addOperatorForm.patchValue({ companyLogo: res.imageUrl });
        }
      },
      error: (err) => {
        console.error('File upload failed', err);
        alert('Failed to upload company logo.');
      }
    });
  }

  submitAddOperator(): void {
    if (this.addOperatorForm.invalid) return;

    this.formSubmitting = true;
    const operatorData = this.addOperatorForm.value; // includes imageUrl now

    this.operatorService.addOperator(operatorData).subscribe({
      next: () => {
        alert('Operator added successfully!');
        this.formSubmitting = false;
        this.addOperatorForm.reset({ countryCode: '+91' });
        this.closeModal();
        this.fetchOperators();
      },
      error: (err) => {
        console.error('Error adding operator:', err);
        alert('Failed to add operator.');
        this.formSubmitting = false;
      }
    });
  }

  openModal() {
    const modal = document.getElementById('addOperatorModal');
    if (modal) modal.style.display = 'block';
  }

  closeModal() {
    const modal = document.getElementById('addOperatorModal');
    if (modal) modal.style.display = 'none';
  }

  // Inline edit helpers
  editOperator(op: Operator) {
    this.editingOperatorId = op.id;
    this.editForm.setValue({
      operatorName: op.operatorName,
      email: op.email,
      phoneNumber: op.phoneNumber,
      countryCode: op.countryCode,
      companyLogo: op.companyLogo || ''
    });
  }

  cancelEdit() {
    this.editingOperatorId = null;
  }

  saveOperator(id: number) {
    if (this.editForm.invalid) return;
    this.formSubmitting = true;
    this.operatorService.updateOperator(id, this.editForm.value).subscribe({
      next: () => {
        this.fetchOperators();
        this.editingOperatorId = null;
        this.formSubmitting = false;
      },
      error: (err) => {
        console.error('Error updating operator', err);
        this.formSubmitting = false;
      }
    });
  }

  deleteOperator(id: number) {
    if (!confirm('Are you sure you want to delete this operator?')) return;
    this.operatorService.deleteOperator(id).subscribe({
      next: () => this.fetchOperators(),
      error: (err) => console.error('Error deleting operator', err)
    });
  }

  suspendOperator(id: number) {
    if (!confirm('Are you sure you want to suspend this operator?')) return;
    this.operatorService.suspendOperator(id).subscribe({
      next: () => alert('Operator suspended successfully!'),
      error: (err) => console.error('Error suspending operator', err)
    });
  }

  operatorLogin(email: string): void {
    if (!email) return;
    const encodedEmail = encodeURIComponent(email);
    const url = `http://ccirbt.mobbilewap.com/login?email=${encodedEmail}`;
    window.open(url, '_blank');
  }

  fc(field: string): FormControl {
    return this.editForm.get(field) as FormControl;
  }
}
