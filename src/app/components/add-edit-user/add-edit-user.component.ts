import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { ErrorModel } from 'src/app/models/error.model';
import { User } from 'src/app/models/user.model';
import { UserTrackerError } from 'src/app/models/userTrackerError.model';
import { NotificationService } from 'src/app/services/notification.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.scss'],
})
export class AddEditUserComponent implements OnInit {
  addUserSubscription: Subscription = new Subscription();
  updateUserSubscription: Subscription = new Subscription();

  id!: number;
  userDetails!: FormGroup;
  error!: ErrorModel[];
  notFoundError!: string;
  newUser!: User;
  isAddMode!: boolean;

  genders: string[] = ['male', 'female'];
  statuses: string[] = ['active', 'inactive'];

  constructor(
    public spinnerService: SpinnerService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _formBuilder: FormBuilder,
    private _notifyService: NotificationService
  ) {}

  get userInputs() {
    return this.userDetails.controls;
  }

  ngOnInit(): void {
    this.id = this._route.snapshot.params['id'];

    this.isAddMode = !this.id;

    this.userDetails = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      gender: ['', Validators.required],
      status: ['', Validators.required],
    });

    if (!this.isAddMode) {
      this._userService
        .getUserById(this.id)
        .pipe(first())
        .subscribe(
          (user) => this.userDetails.patchValue(user),
          (err: HttpErrorResponse) => {
            this.notFoundError = err.error.message;
            console.log(err);
          }
        );
    }
  }

  onSubmit() {
    if (this.isAddMode) {
      this.addUser();
    } else {
      this.updateUser();
    }
  }

  addUser() {
    if (this.userDetails.invalid) {
      this.validateAllFormFields(this.userDetails);
      return;
    }
    this.newUser = this.userDetails.value;
    this.addUserSubscription = this._userService
      .addUser(this.newUser)
      .subscribe(
        (user) => {
          this._router.navigate(['/']);
          this._notifyService.showSuccess(
            `User ${this.newUser.name} added successfully`,
            'Success'
          );
          console.log(user);
        },
        (err: UserTrackerError) => {
          this.error = err.error;
          console.log(err);
        }
      );
  }

  updateUser() {
    if (this.userDetails.invalid) {
      this.validateAllFormFields(this.userDetails);
      return;
    }

    this.newUser = this.userDetails.value;
    this.updateUserSubscription = this._userService
      .updateUser(this.id, this.newUser)
      .subscribe(
        (user: void | UserTrackerError) => {
          this._router.navigate(['/']);
          this._notifyService.showSuccess(
            `User ${this.newUser.name} updated successfully`,
            'Success'
          );
          console.log(user);
        },
        (err: UserTrackerError) => {
          this.error = err.error;
          console.log(err);
        }
      );
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control?.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  ngOnDestroy() {
    this.addUserSubscription.unsubscribe();
    this.updateUserSubscription.unsubscribe();
  }
}
