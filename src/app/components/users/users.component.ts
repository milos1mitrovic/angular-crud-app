import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UserTrackerError } from 'src/app/models/userTrackerError.model';
import { NotificationService } from 'src/app/services/notification.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
  getUsersSubscription: Subscription = new Subscription();
  deleteUserSubscription: Subscription = new Subscription();

  error: string = '';
  users: User[] = [];
  page: number = 1;

  newUser!: User;

  constructor(
    public spinnerService: SpinnerService,
    private _userService: UserService,
    private _router: Router,
    private _notifyService: NotificationService
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    this.getUsersSubscription = this._userService
      .fetchUsers(this.page)
      .subscribe(
        (users: User[] | UserTrackerError) => {
          this.users = <User[]>users;
        },
        (err: any) => {
          this.error = err.friendlyMessage;
          console.log(err);
        },
        () => console.log(this.users)
      );
  }

  onAddUser() {
    this._router.navigate(['/add-user']);
    this._notifyService.removeToastr();
  }

  onUpdateUser(id: number) {
    this._router.navigate(['/edit-user', id]);
    this._notifyService.removeToastr();
  }

  deleteUser(userId: number, name: string) {
    this.deleteUserSubscription = this._userService
      .deleteUser(userId)
      .subscribe(() => {
        this._notifyService.showWarning(
          `User ${name} deleted successfully`,
          'Success'
        );
        this.getAllUsers();
      });
  }

  nextPage() {
    this.page++;
    this.getAllUsers();
  }

  prevPage() {
    if (this.page !== 1) {
      this.page--;
      this.getAllUsers();
    }
  }

  ngOnDestroy() {
    this.getUsersSubscription.unsubscribe();
    this.deleteUserSubscription.unsubscribe();
  }
}
