import { DatePipe } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AccountService } from '../../../core/services/account-service';
import { MemberService } from '../../../core/services/member-service';
import { ToastService } from '../../../core/services/toast-service';
import { EditableMember, Member } from '../../../types/member';

@Component({
  selector: 'app-member-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './member-profile.html',
  styleUrl: './member-profile.css',
})
export class MemberProfile implements OnInit, OnDestroy {
  @ViewChild('editForm') editForm!: NgForm;
  @HostListener('window:beforeunload', ['$event']) notify($event: BeforeUnloadEvent) {
    if (this.editForm?.dirty) {
      $event.preventDefault();
    }
  }
  private accountService = inject(AccountService);
  private toast = inject(ToastService);
  protected memberService = inject(MemberService);
  protected member = signal<Member | undefined>(undefined);
  protected editableMember: EditableMember = {
    displayName: '',
    city: '',
    country: '',
    description: '',
  };

  ngOnInit(): void {
    this.editableMember = {
      displayName: this.memberService.member()?.displayName || '',
      city: this.memberService.member()?.city || '',
      country: this.memberService.member()?.country || '',
      description: this.memberService.member()?.description || '',
    };
  }

  ngOnDestroy(): void {
    if (this.memberService.editMode()) {
      this.memberService.editMode.set(false);
    }
  }

  updateProfile() {
    if (!this.memberService.member()) return;
    const updatedMember = {
      ...this.memberService.member(),
      ...this.editableMember,
    };
    this.memberService.updateMember(this.editableMember).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if (currentUser && updatedMember.displayName !== currentUser?.displayName) {
          currentUser.displayName = updatedMember.displayName;
          this.accountService.setCurrentUser(currentUser);
        }
        this.toast.success('Profile updated successfully');
        this.memberService.editMode.set(false);
        this.memberService.member.set(updatedMember as Member);
        this.editForm?.reset(updatedMember);
      },
      error: (error) => {
        this.toast.error('Failed to update profile: ' + error);
      },
    });
  }
}
