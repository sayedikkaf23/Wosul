import { ToastrModule, ToastrService } from 'ngx-toastr';

export class CustomOption extends ToastrService {
  animate = 'flyRight';
  showCloseButton = true;
  positionClass = 'toast-top-center';
}
