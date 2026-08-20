import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { ContractService } from 'src/app/service/cp-service/contract.service';
import { ToastrService } from 'ngx-toastr';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { ContentUploadService } from 'src/app/service/cp-service/content-upload.service';
import { finalize, firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';
import { OtpModalComponent } from 'src/app/shared/components/otp-modal/otp-modal.component';
import { SecurityDownloadService } from 'src/app/service/security-download.service';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css'],
})
export class ContractsComponent implements AfterViewInit {
  @ViewChild('contractTableScrollContainer') contractTableScrollContainer!: ElementRef;
  @ViewChild('contractTableScrollSlider') contractTableScrollSlider!: ElementRef;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  scrollPositionContract = 0;

  isEditing: boolean[] = [];

  excelRowCount = 0;

  uploadedFiles: File[] = [];

  excelFile: File | null = null;
  contractFiles: File[] = [];

  selectedContractExcel: File | null = null;
  selectedContractFiles: File[] = [];
  contractList: any[] = [];

  isUploading: boolean = false;
  isLoading: boolean = false;
  searchQuery: string = '';

  contractZipFile: File | null = null;

  contractCodeMap: {
    [key: string]: {
      code: string;
      name: string;
      fileUrl: string;
      fromDate: string;
      toDate: string;
      expiryDate: string;
    }[];
  } = {};

  previewData: any = null;

  rowEditable: boolean[] = [];

  allContractCodes: {
    code: string;
    name: string;
    fileUrl: string;
    fromDate?: string;
    toDate?: string;
    expiryDate?: string;
  }[] = [];

  currentFileUrl = '';
  currentFileName = '';

  // reference to the reusable OTP modal component
  @ViewChild(OtpModalComponent) otpModal!: OtpModalComponent;

  form = this.fb.group({
    contracts: this.fb.array<FormGroup>([]),
  });
  selectedFiles: any;
  additionalDocs: any;

  hasMainContract: boolean = false;
  showMainContractModal: boolean = false;
  mainContractUrl: string = '';
  contractSource: 'existing' | 'new' = 'existing';
  selectedExistingContract: string | null = null;
  contractName: string = '';
  contractCodeSet: Set<unknown> | undefined;
  mainContractFromDate: string = '';
  mainContractToDate: string = '';


  get contracts(): FormArray<FormGroup> {
    return this.form.get('contracts') as FormArray<FormGroup>;
  }

  constructor(
    private contentUploadService: ContentUploadService,
    private fb: FormBuilder,
    private contractService: ContractService,
    private toastr: ToastrService,
    private securityDownloadService: SecurityDownloadService

  ) { }

  ngOnInit() {
    this.selectedFiles = this.contracts.controls.map(() => []);
    this.checkMainContract();
    // const main = this.uniqueContracts.find(c => c.name === 'MAIN_CONTRACT');
    // if (main) {
    //   this.selectedExistingContract = main.code;
    //   this.contractName = main.name;
    // }

  }

  ngAfterViewInit(): void {
  }
  get uniqueContracts() {
    const map = new Map<string, any>();

    this.allContractCodes.forEach(c => {
      if (!map.has(c.code)) {
        map.set(c.code, c);
      }
    });

    let contracts = Array.from(map.values());

    // Ensure MAIN_CONTRACT exists
    const hasMain = contracts.some(c => c.name === 'MAIN_CONTRACT');

    if (!hasMain) {
      contracts.unshift({
        code: 'MAIN_CONTRACT',
        name: 'MAIN_CONTRACT'
      });
    }

    // Put MAIN_CONTRACT on top
    contracts.sort((a, b) => {
      if (a.name === 'MAIN_CONTRACT') return -1;
      if (b.name === 'MAIN_CONTRACT') return 1;
      return a.name.localeCompare(b.name);
    });

    return contracts;
  }
  selectContract(value: string | null): void {

    this.selectedExistingContract = value;

    if (value === 'MAIN_CONTRACT') {
      this.contractName = 'MAIN_CONTRACT';
      return;
    }

    const selected = this.uniqueContracts?.find(c => c.code === value);

    if (selected) {
      this.contractName = selected.name;
    } else {
      this.contractName = '';
    }
  }

  loadPageData() {
    this.isLoading = true;
    console.log('Loading page data...');
    this.getContractListPage();
    this.getContractList();
    this.getAdditionalDocs();

    this.isLoading = false;
  }

  checkMainContract() {
    const cpId = sessionStorage.getItem('id');
    if (!cpId) return;

    this.contractService.getMainContract(cpId).subscribe({
      next: (res: any) => {
        console.log("Main contract response:", res);
        this.hasMainContract = !!res?.contractFileUrl;
        this.mainContractUrl = res.contractFileUrl || '';
        this.showMainContractModal = !this.hasMainContract;

        if (this.hasMainContract) {
          this.loadPageData();
        }
      },
      error: () => {
        this.showMainContractModal = true;
      }
    });
  }

  onMainContractUpload(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // HARD VALIDATION
    if (!this.mainContractFromDate || !this.mainContractToDate) {
      this.toastr.error(
        'From Date and To Date are mandatory for Main Contract.'
      );
      return;
    }

    if (new Date(this.mainContractFromDate) > new Date(this.mainContractToDate)) {
      this.toastr.error('From Date cannot be after To Date.');
      return;
    }

    const cpId = sessionStorage.getItem('id');
    if (!cpId) return;

    const formData = new FormData();
    formData.append('mainContract', file);
    formData.append('cpId', cpId);
    formData.append('fromDate', this.mainContractFromDate);
    formData.append('toDate', this.mainContractToDate);
    formData.append('contractName', this.contractName)

    this.contractService.uploadMainContract(formData).subscribe({
      next: () => {
        this.toastr.success('Main contract uploaded successfully');

        this.showMainContractModal = false;
        this.hasMainContract = true;

        // Reset after success
        this.mainContractFromDate = '';
        this.mainContractToDate = '';

        this.loadPageData();

      },
      error: () => {
        this.toastr.error('Failed to upload main contract');
      }
    });
  }

  private createRow(contract?: any): FormGroup {
    return this.fb.group({
      id: new FormControl(contract?.id ?? null),
      songName: new FormControl(contract?.songName ?? ''),
      // store yyyy-MM-dd string (not Date object)
      fromDate: new FormControl({
        value: contract?.fromDate ?? '',
        disabled: true,
      }),
      toDate: new FormControl({
        value: contract?.toDate ?? '',
        disabled: true,
      }),
      expiryDate: new FormControl({
        value: contract?.expiryDate ?? '',
        disabled: true,
      }),

      contractFile: new FormControl<File | null>(null),
      contractFileUrl: new FormControl(contract?.contractFileUrl ?? ''),
      active: new FormControl(contract?.active ?? ''),
      contractCode: new FormControl(contract?.contractCode ?? ''),
      contractName: new FormControl(contract?.contractName ?? ''),
    });
  }

  private setRowEnabled(i: number, enabled: boolean) {
    const grp = this.contracts.at(i);
    if (!grp) return;

    const editableFields = ['fromDate', 'toDate', 'expiryDate', 'contractFile'];
    editableFields.forEach((field) => {
      const ctrl = grp.get(field);
      if (!ctrl) return;
      enabled
        ? ctrl.enable({ emitEvent: false })
        : ctrl.disable({ emitEvent: false });
    });
  }

  goToSongPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.getContractListPage(); // call your loading function
    }
  }

  getContractList(): void {
    const id = sessionStorage.getItem('id');
    if (!id) {
      return;
    }

    this.contractService.getContracts(id).subscribe({
      next: (response: any) => {
        // Clear existing form and mappings
        this.contracts.clear();
        this.isEditing = [];
        this.contractCodeMap = {};
        this.allContractCodes = [];
        this.rowEditable = [];

        this.contractList = Array.isArray(response.data) ? response.data : [];
        this.contractList.forEach((item: any, index: number) => {
          // Normalize API data
          const normalized = {
            id: item.id ?? null,
            songName: item.songName ?? '',
            fromDate: item.fromDate ? String(item.fromDate).split('T')[0] : '',
            toDate: item.toDate ? String(item.toDate).split('T')[0] : '',
            expiryDate: item.expiryDate
              ? String(item.expiryDate).split('T')[0]
              : '',
            contractFileUrl: item.contractFileUrl ?? '',
            active: item.active ?? '',
            contractCode: item.contractCode ?? '',
            contractName: item.contractName ?? '',
          };

          // Create form row
          const row = this.createRow(normalized);
          this.contracts.push(row);

          // Disable editing if PDF already exists
          this.rowEditable[index] = !normalized.contractFileUrl;

          // Initialize contractCodeMap array for this row
          if (!this.contractCodeMap[index]) {
            this.contractCodeMap[index] = [];
          }

          // Add mapping for this row
          if (normalized.contractCode) {
            this.contractCodeMap[index].push({
              code: normalized.contractCode,
              name: normalized.contractName ?? '',
              fileUrl: normalized.contractFileUrl ?? '', // empty if PDF not uploaded
              fromDate: normalized.fromDate,
              toDate: normalized.toDate,
              expiryDate: normalized.expiryDate,
            });
          }

          this.contractCodeSet ??= new Set();

          if (
            normalized.contractCode &&
            normalized.contractFileUrl &&
            !this.contractCodeSet.has(normalized.contractCode)
          ) {
            this.contractCodeSet.add(normalized.contractCode);

            this.allContractCodes.push({
              code: normalized.contractCode,
              name: normalized.contractName,
              fileUrl: normalized.contractFileUrl,
              fromDate: normalized.fromDate,
              toDate: normalized.toDate,
              expiryDate: normalized.expiryDate,
            });
          }
          this.selectedFiles[index] = [];
        });
      },

      error: (err) => {
        this.contracts.clear();
        this.isEditing = [];
        this.contractCodeMap = {};
        this.allContractCodes = [];
        this.rowEditable = [];
      },
    });
  }

  get uniqueContractCodes(): string[] {
    return Array.from(
      new Set(this.allContractCodes.map(c => c.code))
    );
  }


  getContractListPage(): void {
    const id = sessionStorage.getItem('id');
    if (!id) return;

    this.contractService
      .getContractsPage(id, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: any) => {
          this.contracts.clear();
          this.isEditing = [];
          this.contractCodeMap = {};
          this.allContractCodes = [];
          this.rowEditable = [];

          const data = response.data.content || [];
          this.totalPages = response.data.totalPages;

          data.forEach((item: any, index: number) => {
            const normalized = {
              id: item.id ?? null,
              songName: item.songName ?? '',
              fromDate: item.fromDate?.split('T')[0] ?? '',
              toDate: item.toDate?.split('T')[0] ?? '',
              expiryDate: item.expiryDate?.split('T')[0] ?? '',
              contractFileUrl: item.contractFileUrl ?? '',
              active: item.active ?? '',
              contractCode: item.contractCode ?? '',
              contractName: item.contractName ?? '',
            };

            const row = this.createRow(normalized);
            this.contracts.push(row);

            this.rowEditable[index] = !normalized.contractFileUrl;
            this.contractCodeMap[index] = normalized.contractCode
              ? [
                {
                  code: normalized.contractCode,
                  name: normalized.contractName ?? '',
                  fileUrl: normalized.contractFileUrl,
                  fromDate: normalized.fromDate,
                  toDate: normalized.toDate,
                  expiryDate: normalized.expiryDate,
                },
              ]
              : [];

            if (normalized.contractCode && normalized.contractFileUrl) {
              this.allContractCodes.push({
                code: normalized.contractCode,
                name: normalized.contractName,
                fileUrl: normalized.contractFileUrl,
                fromDate: normalized.fromDate,
                toDate: normalized.toDate,
                expiryDate: normalized.expiryDate,
              });
            }
            this.selectedFiles[index] = [];
          });
        },
        error: () => {
          this.contracts.clear();
          this.isEditing = [];
        },
      });
  }

  editContract(i: number) {
    this.isEditing[i] = true;
    this.setRowEnabled(i, true);
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date.split('T')[0];
  }

  saveContract(i: number) {
    const grp = this.contracts.at(i) as FormGroup;
    if (!grp) return;

    const v = grp.getRawValue();
    const selectedCode = v.contractCode;

    //   Default to existing fileUrl if already present
    let contractFileUrl = v.contractFileUrl;

    //   Find the selected contract details from allContractCodes
    const matched = this.allContractCodes.find((c) => c.code === selectedCode);

    if (matched) {
      // Auto-update the form values with matched data
      grp.patchValue({
        fromDate: this.formatDateForInput(matched.fromDate ?? ''),
        toDate: this.formatDateForInput(matched.toDate ?? ''),
        expiryDate: this.formatDateForInput(matched.expiryDate ?? ''),
        contractFileUrl: matched.fileUrl,
        contractName: matched.name
      });

      contractFileUrl = matched.fileUrl;
    } else {
    }

    //   Prepare payload
    const payload = {
      id: v.id,
      fromDate: this.formatDateTime(v.fromDate),
      toDate: this.formatDateTime(v.toDate),
      expiryDate: this.formatDateTime(v.expiryDate),
      contractFileUrl: contractFileUrl,
      contractCode: selectedCode,
      contractName: matched ? matched.name : v.contractName
    };

    //   API call
    this.contractService.saveContract(payload).subscribe({
      next: () => {
        this.toastr.success('Contract updated successfully!');
        this.isEditing[i] = false;
        this.setRowEnabled(i, false);
        this.getContractListPage();
      },
      error: (err) => {
        this.toastr.error('Failed to update contract');
      },
    });
  }

  formatDateTime(dateString?: string): string | null {
    if (!dateString) return null;
    // If only date (YYYY-MM-DD), append T00:00:00
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString + 'T00:00:00';
    }
    // Otherwise, try ISO format
    const d = new Date(dateString);
    return d.toISOString().split('.')[0]; // 2021-01-02T00:00:00
  }

  //   Helper function for date formatting
  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0]; // "2025-01-03T00:00:00" → "2025-01-03"
  }

  onFileUpload(event: Event, i: number) {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];

      // Save file for UI
      this.selectedFiles[i] = [file];

      const grp = this.contracts.at(i);

      // Set file in form control
      grp?.get('contractFile')?.setValue(file);

      // Upload to backend
      const formData = new FormData();
      formData.append('contractFile', file);

      this.contractService.uploadContract(formData).subscribe({
        next: (res: any) => {
          const url = res?.url || '';
          grp?.get('contractFileUrl')?.setValue(url); //   save returned URL
          this.toastr.success('Contract uploaded successfully!');
        },
        error: (err) => {
          this.toastr.error('Failed to upload contract');
        },
      });
    } else {
      this.selectedFiles[i] = [];
    }
  }

  // Parse Excel
  onExcelUpload(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.toastr.error('Please upload a valid Excel file (.xlsx or .xls)');
      this.excelFile = null;
      this.selectedContractExcel = null;
      return;
    }

    this.excelFile = file;
    this.selectedContractExcel = file;

    // Reset contract selection when new Excel uploaded
    this.selectedExistingContract = null;
    this.contractZipFile = null;
    this.contractName = '';

    // Read Excel to count rows
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      this.excelRowCount = jsonData.length;
    };

    reader.readAsArrayBuffer(file);
  }

  // Capture multiple contract files
  onContractFilesSelected(event: any) {
    const files: FileList = event.target.files;
    this.selectedContractFiles = Array.from(files);

    this.contractFiles = Array.from(event.target.files);
  }

  async uploadAll() {

    //  Excel is always mandatory
    if (!this.excelFile) {
      this.toastr.error('Please upload the Excel file first.');
      return;
    }

    const cpId = sessionStorage.getItem('id') || '';
    this.isUploading = true;

    try {

      // NEW CONTRACT ZIP
      if (!this.selectedExistingContract) {

        if (!this.contractZipFile) {
          this.toastr.warning('Please select the contract ZIP file.');
          this.isUploading = false;
          return;
        }

        const skipDateValidation =
          true;


        // Validate Excel + ZIP only in this case
        const isValid = await this.validateExcelAndZip(
          this.excelFile,
          this.contractZipFile,
          skipDateValidation
        );

        if (!isValid) {
          this.toastr.error(
            'Validation failed! Please check your Excel and ZIP files.'
          );
          this.isUploading = false;
          return;
        }


        const formData = new FormData();
        formData.append('contractExcelFile', this.excelFile);
        formData.append(
          'contractsZip',
          this.contractZipFile,
          this.contractZipFile.name
        );
        formData.append('cpId', cpId);
        formData.append('existingContract', 'NEW');
        formData.append('contractName', this.contractName)

        this.contractService
          .uploadBulkContracts(formData)
          .pipe(
            finalize(() => {
              this.isUploading = false;
            })
          )
          .subscribe({
            next: () => this.handleUploadSuccess(),
            error: () => this.handleUploadError(),
          });

        return;
      }

      //  MAIN_CONTRACT
      if (this.selectedExistingContract === 'MAIN_CONTRACT') {

        const payload = {
          cpId: cpId,
          mainUrl: this.mainContractUrl
          // fromDate & toDate will be read from Excel by backend
        };
        const formData = new FormData();
        formData.append('mainContractUrl', this.mainContractUrl);
        formData.append('cpId', cpId);
        formData.append('existingContract', 'MAIN_CONTRACT');
        formData.append('contractExcelFile', this.excelFile);
        formData.append('contractName', this.contractName)
        this.contractService
          .uploadBulkContracts(formData)
          .pipe(
            finalize(() => {
              this.isUploading = false;
            })
          )
          .subscribe({
            next: () => this.handleUploadSuccess(),
            error: () => this.handleUploadError(),
          });

        return;
      }

      //EXISTING CONTRACT CODE
      const payload = {
        cpId: cpId,
        contractCode: this.selectedExistingContract
        // fromDate & toDate from Excel
      };
      const formData = new FormData();
      formData.append('contractCode', this.selectedExistingContract);
      formData.append('contractName', this.contractName);
      formData.append('cpId', cpId);
      formData.append('existingContract', 'EXISTING_CODE');
      formData.append('contractExcelFile', this.excelFile);
      this.contractService
        .uploadBulkContracts(formData)
        .pipe(
          finalize(() => {
            this.isUploading = false;
          })
        )
        .subscribe({
          next: () => this.handleUploadSuccess(),
          error: () => this.handleUploadError(),
        });

    } catch (error) {
      this.isUploading = false;
      this.toastr.error('An unexpected error occurred during upload.');

    }
  }

  handleUploadError() {
    this.toastr.error('Failed to upload contracts.');
  }

  onSourceChange() {
    this.selectedExistingContract = null;
    this.contractZipFile = null;
    this.contractName = '';
  }

  isFormValid(): boolean {

    // Excel mandatory
    if (!this.excelFile) return false;

    // Must choose contract source
    if (!this.contractSource) return false;

    // Existing contract selected
    if (this.contractSource === 'existing') {
      return this.selectedExistingContract != null;
    }

    // New contract selected
    if (this.contractSource === 'new') {
      return (
        this.contractZipFile != null &&
        this.contractName != null &&
        this.contractName.trim() !== ''
      );
    }

    return false;
  }

  handleUploadSuccess() {
    this.toastr.success('Contracts uploaded successfully!');
    this.getContractListPage();
    this.getContractList();
    this.getAdditionalDocs();

    this.contractZipFile = null;
    this.excelFile = null;
    this.selectedContractExcel = null;
    this.excelRowCount = 0;

    // IMPORTANT
    this.selectedExistingContract = null;
  }



  async validateExcelAndZip(excelFile: File, zipFile: File, skipDateValidation: boolean) {
    try {
      // Step 1: Read Excel
      const excelData = await excelFile.arrayBuffer();
      const workbook = XLSX.read(excelData);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const dataRows = rows
        .slice(1)
        .filter((row) =>
          row.some((cell) => cell !== null && cell !== undefined && cell !== '')
        );

      if (dataRows.length === 0) {
        this.toastr.error('Excel file must contain at least one data row.');
        return false;
      }

      // Step 2: Validate "From Date" and "To Date" columns are not empty
      // Assuming columns:
      // ID (A), Artist (B), Album (C), Song (D), Song Desc (E), Language (F), Genre (G),
      // CP Name (H), Licensed Country (I), Licensed MNO (J), Year (K), From Date (L), To Date (M)
      const fromDateCol = 11; // index 11 => column L (0-based index)
      const toDateCol = 12; // index 12 => column M

      const invalidRows: number[] = [];
      if (!skipDateValidation) {
        dataRows.forEach((row, idx) => {
          const fromDate = row[fromDateCol];
          const toDate = row[toDateCol];

          if (
            !fromDate ||
            !toDate ||
            String(fromDate).trim() === '' ||
            String(toDate).trim() === ''
          ) {
            invalidRows.push(idx + 1); // +2 because 1 for header, 1 for 0-based index
          }
        });
      }


      if (invalidRows.length > 0) {
        this.toastr.error(
          `From Date and To Date cannot be empty. Check rows: ${invalidRows.join(
            ', '
          )}`
        );
        return false;
      }

      // Step 3: Validate ZIP file (must contain exactly one PDF starting with "contract_")
      const zipData = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(zipData);

      const matchingPdfs = Object.keys(zip.files).filter((fileName) => {
        const lower = fileName.toLowerCase();
        return lower.endsWith('.pdf') && lower.startsWith('contract_');
      });

      return true;
    } catch (error) {
      this.toastr.error(
        'Error while validating files. Please check the selected files.'
      );
      return false;
    }
  }

  viewContract(fileUrl: string) {
    if (fileUrl) {
      // Open in new tab
      window.open(fileUrl, '_blank');
    }
  }

  downloadContract(fileUrl: string): void {
    if (!fileUrl) {
      this.toastr.error('No contract file available');
      return;
    }
    window.open(fileUrl, '_blank'); // opens in new tab
  }

  async downloadPrefilledContractTemplate() {


    const allContracts = this.contractList || [];

    // Step 1: Filter contracts where contract is active and not uploaded yet
    const contracts = allContracts.filter(
      (item: any) => item.toDate === null && item.active === true
    );

    // Step 2: Filter contracts with missing critical fields
    const contractsToPrefill = contracts.filter(
      (c: any) => !c.toDate || !c.artistName || !c.cpName
    );

    if (!contractsToPrefill || contractsToPrefill.length === 0) {
      this.toastr.warning(
        'No contract data available to prefill the template.'
      );
      return;
    }

    const workbook = new Workbook();
    const mainSheet = workbook.addWorksheet('UploadContracts');
    const hiddenSheet = workbook.addWorksheet('ExistingSongIds');
    hiddenSheet.state = 'veryHidden';

    //   Step 5: Add hidden 'ID' column (1st column)
    const headers = [
      'ID (Hidden)',
      'Artist Name',
      'Album Name',
      'Song Name',
      'Song Description',
      'Sub Category',
      'Category',
      'Language',
      'Genre',
      'CP Name',
      'Licensed Country',
      'Licensed MNO',
      'Year of The Song',
      'From Date (dd-mm-yyyy) Optional',
      'To End Date (dd-mm-yyyy) Optional',
      // 'Contract Expiry (dd-mm-yyyy)'
    ];

    const headerRow = mainSheet.addRow(headers);

    // Header styling
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0D6EFD' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Set column widths
    mainSheet.columns = headers.map((h) => ({ header: h, width: 25 }));

    //   Hide the ID column
    mainSheet.getColumn(1).hidden = true;

    // Helper function
    const styleAndValidateRow = (row: ExcelJS.Row, rowIndex: number) => {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowIndex % 2 === 0 ? 'FFFFFFFF' : 'FFF5F5F5' },
      };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
      });

      // Validation examples (adjusted column letters since ID is now col A)
      row.getCell('F').dataValidation = {
        type: 'custom',
        formulae: [`LEN(TRIM(F${rowIndex}))>0`],
        showErrorMessage: true,
        errorTitle: 'CP Name Required',
        error: 'Please enter CP Name.',
      };

      ['J', 'K', 'L'].forEach((col) => {
        const cell = row.getCell(col);
        cell.numFmt = 'dd-mm-yyyy';
        cell.dataValidation = {
          type: 'date',
          operator: 'between',
          formulae: [new Date('1900-01-01'), new Date('2100-12-31')],
          showErrorMessage: true,
          errorTitle: 'Invalid Date',
          error: 'Please enter a valid date in dd-mm-yyyy format',
        };
      });
    };

    // Step 7: Prefill rows
    contractsToPrefill.forEach((c: any, index: number) => {
      const row = mainSheet.addRow([
        c.id || '', //   Hidden ID column
        c.artistName || '',
        c.albumName || '',
        c.songName || '',
        c.songDescription || '',
        c.subCategory || '',
        c.category || '',
        c.language || '',
        c.genre || '',
        c.cpName || '',
        c.country || '',
        c.mno || '',
        c.songYear || '',
        c.fromDate ? new Date(c.fromDate) : '',
        c.toDate ? new Date(c.toDate) : '',
        // c.expiryDate ? new Date(c.expiryDate) : ''
      ]);
      styleAndValidateRow(row, index + 2);
    });

    // Step 8: Blank rows
    for (
      let rowIndex = contractsToPrefill.length + 2;
      rowIndex <= 1000;
      rowIndex++
    ) {
      const row = mainSheet.getRow(rowIndex);
      styleAndValidateRow(row, rowIndex);
    }

    // Step 9: Save Excel
    const buf = await workbook.xlsx.writeBuffer();
    FileSaver.saveAs(
      new Blob([buf], { type: 'application/octet-stream' }),
      'contracts_prefilled.xlsx'
    );
  }

  onContractCodeChange(rowIndex: number) {
    const selectedCode = this.contracts.at(rowIndex).get('contractCode')?.value;

    if (!selectedCode) return;

    // Find mapping from allContractCodes
    const mapping = this.allContractCodes.find((c) => c.code === selectedCode);

    if (mapping) {
      // Fill the dates in the form row
      const row = this.contracts.at(rowIndex);
      row.get('fromDate')?.setValue(mapping.fromDate ?? '');
      row.get('toDate')?.setValue(mapping.toDate ?? '');
      // row.get('expiryDate')?.setValue(mapping.expiryDate ?? '');

      // Optionally fill contract file URL
      // row.get('contractFileUrl')?.setValue(mapping.fileUrl ?? '');
    }
  }

  // Helper to format date if needed

  onContractZipChange(event: any) {
    const file: File = event.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      this.toastr.error('Please upload a valid ZIP file (.zip)');
      this.contractZipFile = null;
      return;
    }

    // Optional size validation (100MB example)
    // const maxSize = 100 * 1024 * 1024;
    // if (file.size > maxSize) {
    //   this.toastr.error('ZIP file too large. Max 100MB allowed.');
    //   this.contractZipFile = null;
    //   return;
    // }

    this.contractZipFile = file;

    // If uploading new ZIP → clear existing contract
    this.selectedExistingContract = null;

    // Reset input so user can reselect same file
    event.target.value = '';
  }

  previewContract(url: string | undefined) {
    if (!url || !url.startsWith('http')) {
      this.toastr.warning('File preview not available.');
      return;
    }
    window.open(url, '_blank');
  }

  // called from OTP modal (once user enters OTP)
  otpAttempts = 0; // Track OTP attempts
  maxOtpAttempts = 3; // Maximum allowed attempts

  async onOtpVerified(enteredOtp: string) {
    try {
      const res: any = await firstValueFrom(
        this.securityDownloadService.verifyOtp(this.currentFileName, enteredOtp)
      );

      if (res?.verified) {
        this.toastr.success('OTP verified — opening contract preview.');
        this.securityDownloadService.openFile(this.currentFileUrl);
        this.otpAttempts = 0;
      } else {
        this.otpAttempts++;
        const remaining = this.maxOtpAttempts - this.otpAttempts;

        if (remaining > 0) {
          this.toastr.warning(
            `Invalid OTP. You have ${remaining} attempt(s) left.`
          );
        } else {
          this.toastr.error('You have exceeded the maximum OTP attempts.');
          this.otpModal.close();
          this.otpAttempts = 0;
        }
      }
    } catch (err) {
      this.toastr.error('Error verifying OTP. Try again later.');
    }
  }

  // optional: when OTP modal is closed/cancelled
  onOtpCancelled() {
    this.toastr.info('Contract preview cancelled by user.');
  }

  getAdditionalDocs(): void {
    const cpId = sessionStorage.getItem('id');
    if (!cpId) return;

    this.contentUploadService.getAdditionalDoc(cpId).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          // Filter to keep only unique file names
          const uniqueFiles = res.filter(
            (doc, index, self) =>
              index === self.findIndex((d) => d.fileName === doc.fileName)
          );

          this.additionalDocs = uniqueFiles;
        } else {
          this.additionalDocs = [];
        }
      },
      error: (err: any) => {
        this.additionalDocs = [];
      },
    });
  }

  openPreview(rowIndex: number) {
    const row = this.contracts.at(rowIndex);

    const mainUrl = row.get('contractFileUrl')?.value;
    const code = row.get('contractCode')?.value;

    // Filter additionalDocs based on contract code or song ID
    // const filteredDocs = this.additionalDocs.filter((d: any) =>
    //   d.contractCode === code || d.songId === row.get("song")?.value
    // );

    this.previewData = {
      mainUrl: this.mainContractUrl,
      docs: this.additionalDocs,
      fileName: this.getFileName(mainUrl)
    };

    // Open Bootstrap Modal
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('previewModal')
    );
    modal.show();
  }

  getFileName(url: string): string {
    if (!url) return '';
    return url.substring(url.lastIndexOf('/') + 1);
  }

  // Scroll Slider Methods for Contract Table
  onTableScrollContract(value: string): void {
    const scrollPercent = parseInt(value, 10);
    if (this.contractTableScrollContainer) {
      const element = this.contractTableScrollContainer.nativeElement;
      const maxScroll = element.scrollWidth - element.clientWidth;
      element.scrollLeft = (scrollPercent / 100) * maxScroll;
    }
  }

  updateScrollSliderContract(): void {
    if (this.contractTableScrollContainer && this.contractTableScrollSlider) {
      const element = this.contractTableScrollContainer.nativeElement;
      const maxScroll = element.scrollWidth - element.clientWidth;
      const scrollPercent = (element.scrollLeft / maxScroll) * 100;
      this.scrollPositionContract = Math.min(scrollPercent, 100);
    }
  }

}
