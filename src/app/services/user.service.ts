import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { User } from '../models/user.model';
import { UserTrackerError } from '../models/userTrackerError.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string = environment.apiURL;

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization:
      'Bearer 7ab8ab921cd67e0350936671450ee8d874e6dbc36b6986594335ba43fe68aaeb',
  });

  constructor(private _http: HttpClient) {}

  fetchUsers(page: number): Observable<User[] | UserTrackerError> {
    return this._http
      .get<User[]>(`${this.apiUrl}?page=${page}`, {
        headers: this.headers,
      })
      .pipe(
        map((users) => {
          return users;
        }),
        catchError((err) => this.handleHttpError(err))
      );
  }

  updateUser(id: number, user: User): Observable<void | UserTrackerError> {
    return this._http
      .put<void>(`${this.apiUrl}${id}`, user, {
        headers: this.headers,
      })
      .pipe(catchError((err) => this.handleHttpError(err)));
  }

  getUserById(id: number): Observable<User | UserTrackerError> {
    return this._http
      .get<User>(`${this.apiUrl}${id}`, {
        headers: this.headers,
      })
      .pipe(catchError((err) => this.handleHttpError(err)));
  }

  addUser(newUser: User): Observable<User> {
    return this._http.post<User>(`${this.apiUrl}`, newUser, {
      headers: this.headers,
    });
  }

  deleteUser(userId: number): Observable<void> {
    return this._http.delete<void>(`${this.apiUrl}${userId}`, {
      headers: this.headers,
    });
  }

  private handleHttpError(
    error: HttpErrorResponse
  ): Observable<UserTrackerError> {
    const dataError: UserTrackerError = {
      error: error.error,
      message: error.statusText,
      friendlyMessage: 'An error occurred retrieving data',
    };

    return throwError(dataError);
  }
}
