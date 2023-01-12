import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(this.addAuthToken(request)).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const res: any = event?.body;
          // if (res.success) {
          //   this.toaster.Success(res.message);
          // }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // this.toaster.Error('Please login again', 'Session Expired');
          this.authService.logOut();
        }

        if (error.status === 422 || error.status === 404) {
          // this.toaster.Error(error?.error?.message || 'Something went wrong.');
        }
        return throwError(error);
      })
    );
  }

  addAuthToken(request: HttpRequest<any>) {
    const token = this.authService.getToken();
    console.log('token: ', token);
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: token,
        },
      });
    }
    return request;
  }
}
