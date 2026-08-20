// inbox.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { AdminDashboardService } from 'src/app/service/admin-service/admin-dashboard.service';

interface EmailMessage {
  id?: number;
  threadId?: string | number;
  from: string;
  to?: string;
  cc?: string;
  subject?: string;
  content?: string;
  receivedDate?: string | Date;
  starred?: boolean;
  read?: boolean;
  attachments?: { name: string; size: number; url?: string }[];
  loading?: boolean;
}

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit, OnDestroy {

  flag: Boolean = false;

  emails: EmailMessage[] = [];
  selectedEmail: EmailMessage | null = null;

  // Mode: compose / reply / replyAll / forward
  composeMode: 'compose' | 'reply' | 'replyAll' | 'forward' = 'compose';

  // compose model
  compose: any = { id: null, to: '', cc: '', subject: '', body: '', attachments: [] };
  replyOriginal: EmailMessage | null = null;
  replyMessageId: number | null = null;

  // paging
  currentPage = 0;
  pageSize = 12;
  totalMessages = 0;

  // UI state
  loading = false;
  sending = false;
  error = '';
  searchTerm = '';
  toastMessage = '';

  // Polling
  pollingSub?: Subscription;
  autoSaveIntervalId?: any;

  // Tab: inbox/sent/drafts/trash
  activeTab: 'inbox' | 'sent' | 'drafts' | 'trash' = 'inbox';

  constructor(private adminService: AdminDashboardService) { }

  ngOnInit(): void {
    this.loadActiveTab();
    this.pollingSub = interval(45000).subscribe(() => this.pollNewMessages());
    // this.autoSaveIntervalId = setInterval(() => this.autoSaveDraft(), 30000);
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
    if (this.autoSaveIntervalId) clearInterval(this.autoSaveIntervalId);
  }

  /********** Loading & Tabs **********/
  loadActiveTab() {
    if (this.activeTab === 'inbox') this.fetchEmails();
    else if (this.activeTab === 'sent') this.fetchSent();
    else if (this.activeTab === 'drafts') this.fetchDrafts();
    // else if (this.activeTab === 'trash') this.fetchTrash();
  }

  changeTab(tab: 'inbox' | 'sent' | 'drafts' | 'trash') {
    this.activeTab = tab;
    this.currentPage = 0;
    this.emails = [];
    this.selectedEmail = null;
    this.loadActiveTab();
  }

  fetchEmails() {
    this.loading = true;
    this.adminService.fetchEmails(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.emails = res.data || res;
        this.totalMessages = res.total || this.emails.length;
        this.selectedEmail =  null;
        this.loading = false;
      },
      error: () => { this.loading = false; this.toast('Failed to load inbox'); }
    });
  }

  fetchSent() {
    this.loading = true;
    this.adminService.fetchSent(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => { this.emails = res.data || res; this.totalMessages = res.total || this.emails.length; this.loading = false; },
      error: () => { this.loading = false; this.toast('Failed to load sent'); }
    });
  }

  fetchDrafts() {
    this.loading = true;
    this.adminService.getDrafts(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.emails = res.data || res;   // treat drafts as emails
        this.totalMessages = res.total || this.emails.length;
        this.loading = false;

        this.selectedEmail = null;       // drafts don’t have preview
      },
      error: () => {
        this.loading = false;
        this.toast('Failed to load drafts');
      }
    });
  }

  openDraft(email: any) {
    this.composeMode = 'compose';   // same UI as compose but filled
    this.compose = {
      id: email.id,
      to: email.to || '',
      cc: email.cc || '',
      subject: email.subject || '',
      body: email.body || '',
      attachments: email.attachments || []
    };

    this.showComposeModal();
  }



  fetchTrash() {
    this.loading = true;
    this.adminService.fetchTrash(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => { this.emails = res.data || res; this.totalMessages = res.total || this.emails.length; this.loading = false; },
      error: () => { this.loading = false; this.toast('Failed to load trash'); }
    });
  }

  pollNewMessages() {
    if (this.activeTab !== 'inbox') return;
    this.adminService.pollNew(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        const newCount = res.total || (res.data || []).length;
        if (newCount && newCount > this.totalMessages) {
          this.toast(`You have ${newCount - this.totalMessages} new message(s)`);
          this.fetchEmails();
        }
      }, error: () => { }
    });
  }

  /********** Selection & preview **********/
  selectEmail(email: EmailMessage) {

    if (!email.id) {
      this.toast('Invalid message id');
      return;
    }
    email.read = true;
    this.adminService.markAsRead(email.id).subscribe();


    // detect folder
    let folder = 'INBOX';
    if (this.activeTab === 'sent') folder = 'INBOX.Sent';
    if (this.activeTab === 'drafts') folder = 'INBOX.Drafts';
    if (this.activeTab === 'trash') folder = 'INBOX.Trash';
    if (this.activeTab === 'inbox') folder = 'INBOX';

    this.selectedEmail = { ...email, loading: true };

    this.adminService.getEmail(folder, email.id).subscribe({
      next: (full: any) => {
        this.selectedEmail = full;
      },
      error: () => {
        this.toast('Failed to load email');
        if (this.selectedEmail) this.selectedEmail.loading = false;
      }
    });
  }


  markAsRead(id: number) {
    this.adminService.markAsRead(id).subscribe();
  }


  initials(from: string) {
    if (!from) return '?';
    const name = from.split('@')[0] || from;
    return name.charAt(0).toUpperCase();
  }

  formatEmail(htmlOrText: string) {
    if (!htmlOrText) return '';
    // simple sanitizing: preserve basic tags; you may integrate DomSanitizer if needed
    return htmlOrText;
  }

  toggleStar(email: EmailMessage) {
    email.starred = !email.starred;
    if (email.id) this.adminService.setStar(email.id, email.starred).subscribe(() => { }, () => { });
  }

  /********** Paging & search **********/
  nextPage() { this.currentPage++; this.loadActiveTab(); }
  prevPage() { if (this.currentPage > 0) { this.currentPage--; this.loadActiveTab(); } }
  refreshInbox() { this.loadActiveTab(); }
  search() {
    if (!this.searchTerm) { this.loadActiveTab(); return; }
    this.loading = true;
    this.adminService.searchEmails(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: (res: any) => { this.emails = res.data || res; this.totalMessages = res.total || this.emails.length; this.loading = false; },
      error: () => { this.loading = false; this.toast('Search failed'); }
    });
  }
  clearSearch() { this.searchTerm = ''; this.loadActiveTab(); }

  /********** Compose modal open/close **********/
  openCompose() {
    this.composeMode = 'compose';
    this.compose = { id: null, to: '', cc: '', subject: '', body: '', attachments: [] };
    this.replyOriginal = null;
    this.replyMessageId = null;
    this.showComposeModal();
  }

  showComposeModal() {
    const modalEl: any = document.getElementById('composeModal');
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
  }

  closeComposeModal() {
    const modalEl: any = document.getElementById('composeModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    this.composeMode = 'compose';
    this.compose = { id: null, to: '', cc: '', subject: '', body: '', attachments: [] };
    this.replyOriginal = null;
    this.replyMessageId = null;
  }

  clearCompose() {
    this.compose.body = '';
    this.compose.attachments = [];
  }

  /********** Attachments UI **********/
  triggerFilePicker() {
    const el: any = document.getElementById('filePicker');
    if (el) el.click();
  }

  onAttachmentSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((f: File) => {
      this.compose.attachments.push({ file: f, name: f.name, size: f.size });
    });
    // reset input so same file can be chosen again if removed later
    (event.target as HTMLInputElement).value = '';
  }

  removeAttachment(index: number) {
    this.compose.attachments.splice(index, 1);
  }

  /********** Send / Reply / Forward logic **********/
  sendMail() {
    if (!this.compose.to) { this.toast('Please enter recipient'); return; }
    this.sending = true;

    const formData = new FormData();
    const payload = {
      to: this.compose.to,
      cc: this.compose.cc,
      subject: this.compose.subject,
      body: this.compose.body
    };
    formData.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    if (this.compose.attachments?.length) {
      this.compose.attachments.forEach((a: any) => {
        if (a.file) formData.append('attachments', a.file, a.name);
      });
    }

    if (this.compose.id) {
      // send from draft
      this.adminService.sendDraft(this.compose.id, formData).subscribe({
        next: () => {
          this.sending = false;
          this.toast("Draft sent");
          this.closeComposeModal();
          this.changeTab('sent');
        },
        error: () => { this.sending = false; this.toast('Failed to send draft'); }
      });
    } else {
      // normal new compose
      this.adminService.sendEmail(formData).subscribe({
        next: () => {
          this.sending = false;
          this.toast("Mail sent");
          this.closeComposeModal();
          this.changeTab('sent');
        },
        error: () => { this.sending = false; this.toast('Failed to send mail'); }
      });
    }
  }


  // prepare reply: fills compose fields and opens modal with reply UI
  reply(email: EmailMessage) {
    if (!email) return;
    this.composeMode = 'reply';
    this.replyOriginal = email;
    this.replyMessageId = email.id || null;

    // Set compose fields conservatively - ensure valid address at UI level
    this.compose.to = email.from || '';
    this.compose.cc = '';
    this.compose.subject = (email.subject ? 'Re: ' + email.subject : 'Re:');
    this.compose.body = ''; // user types body; quoted original shown below
    this.showComposeModal();
  }

  replyAll(email: EmailMessage) {
    if (!email) return;
    this.composeMode = 'replyAll';
    this.replyOriginal = email;
    this.replyMessageId = email.id || null;

    // reply-all: include original from and cc in cc field (front-end best-effort)
    this.compose.to = email.from || '';
    this.compose.cc = email.cc || '';
    this.compose.subject = (email.subject ? 'Re: ' + email.subject : 'Re:');
    this.compose.body = '';
    this.showComposeModal();
  }

  forward(email: EmailMessage) {
    if (!email) return;
    this.composeMode = 'forward';
    this.replyOriginal = email;
    this.replyMessageId = email.id || null;

    this.compose.to = '';
    this.compose.cc = '';
    this.compose.subject = (email.subject ? 'Fwd: ' + email.subject : 'Fwd:');
    // show original content inside forward body by default
    this.compose.body = '\n\n----- Forwarded message -----\n' + (email.content || '');
    this.showComposeModal();
  }

  sendReply() {
    if (!this.replyMessageId) { this.toast('Missing original message id'); return; }
    this.sending = true;

    const payload = { body: this.compose.body, to: this.compose.to, cc: this.compose.cc, subject: this.compose.subject };
    this.adminService.replyEmail(this.replyMessageId, payload).subscribe({
      next: (res: any) => {
        this.sending = false;
        this.toast('Reply sent successfully');
        this.closeComposeModal();
        this.changeTab('sent');

      },
      error: (err: any) => {
        this.sending = false;
        this.toast('Reply failed: ' + (err?.error?.message || err?.message || 'Server error'));
      }
    });
  }

  hasSelection(): boolean {
    return this.emails.some((e: any) => e.selected === true);
  }


  sendReplyAll() {
    if (!this.replyMessageId) { this.toast('Missing original message id'); return; }
    this.sending = true;

    const payload = { body: this.compose.body, to: this.compose.to, cc: this.compose.cc, subject: this.compose.subject };
    this.adminService.replyAllEmail(this.replyMessageId, payload).subscribe({
      next: (res: any) => {
        this.sending = false;
        this.toast('Reply All sent successfully');
        this.closeComposeModal();
        this.changeTab('sent');
      },
      error: (err: any) => {
        this.sending = false;
        console.error('sendReplyAll error', err);
        this.toast('Reply All failed: ' + (err?.error?.message || err?.message || 'Server error'));
      }
    });
  }

  sendForward() {
    if (!this.replyMessageId) { this.toast('Missing original message id'); return; }
    if (!this.compose.to) { this.toast('Please enter recipient'); return; }
    this.sending = true;

    // forward via JSON body: backend will extract original attachments automatically if implemented
    const payload = { body: this.compose.body, to: this.compose.to, subject: this.compose.subject };
    this.adminService.forwardEmail(this.replyMessageId, payload).subscribe({
      next: (res: any) => {
        this.sending = false;
        this.toast('Message forwarded successfully');
        this.closeComposeModal();
        this.changeTab('sent');
      },
      error: (err: any) => {
        this.sending = false;
        console.error('sendForward error', err);
        this.toast('Forward failed: ' + (err?.error?.message || err?.message || 'Server error'));
      }
    });
  }

  /********** Drafts & attachments **********/
  saveDraft() {
    const payload = {
      to: this.compose.to,
      cc: this.compose.cc,
      subject: this.compose.subject,
      body: this.compose.body
    };

    if (this.compose.id) {
      // UPDATE existing draft
      this.adminService.updateDraft(this.compose.id, payload).subscribe({
        next: () => this.toast('Draft updated'),
        error: () => this.toast('Failed to update draft')
      });
    } else {
      // SAVE new draft
      this.adminService.saveDraft(payload).subscribe({
        next: (res: any) => {
          this.compose.id = res.id; // newly created draft id
          this.toast('Draft saved');
        },
        error: () => this.toast('Failed to save draft')
      });
    }
  }


  // autoSaveDraft() {
  //   if (!this.compose) return;
  //   if (!this.compose.subject && !this.compose.body) return;
  //   this.adminService.saveDraft({ to: this.compose.to, cc: this.compose.cc, subject: this.compose.subject, body: this.compose.body })
  //     .subscribe(() => { }, () => { });
  // }

  /********** Actions **********/
  deleteEmail(id: any) {
    if (!confirm('Delete this message?')) return;
    this.adminService.deleteEmail(id).subscribe({
      next: () => { this.toast('Deleted'); this.loadActiveTab(); },
      error: () => this.toast('Failed to delete')
    });
  }

  archiveEmail(id: any) {
    this.adminService.archiveEmail(id).subscribe({
      next: () => { this.toast('Archived'); this.loadActiveTab(); },
      error: () => this.toast('Failed to archive')
    });
  }

  markAsUnread(email: EmailMessage) {
    if (!email || !email.id) return;
    this.adminService.markAsUnread(email.id).subscribe({
      next: () => { email.read = false; this.toast('Marked unread'); },
      error: () => this.toast('Failed to mark unread')
    });
  }

  bulkDelete() {
    // placeholder: implement selection logic if needed
    this.toast('Bulk delete not configured on this UI');
  }

  /********** UI helpers **********/
  toast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = '', 3500);
  }

  //   selectEmail(email) {
  //   // show preview skeleton while loading
  //   this.selectedEmail = {...email, loading: true};

  //   this.mailService.getEmail(email.id).subscribe((full: any) => {
  //     this.selectedEmail = full;
  //   }, (err) => {
  //     this.toast('Failed to load email');
  //     this.selectedEmail.loading = false;
  //   });
  // }

}
