import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Helper } from '../../helper';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
 

export interface BackupDetail {
  start_date: any;
  end_date: any;
  is_deleted_from_db: boolean;
}

@Component({
  selector: 'app-database_backup',
  templateUrl: './database_backup.component.html',
  providers: [Helper],
})
export class DatabaseBackupComponent implements OnInit {
  backup_list: any[];
  title: any;
  button: any;
  heading_title: any;
  public message: string;
  public class: string;
  myLoading: boolean = true;

  add_backup_detail: BackupDetail;

  @ViewChild('add_backup_modal')
  add_backup_modal: any;

  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) {}

  activeRoute(routename: string): boolean {
    return this.helper.router.url.indexOf(routename) > -1;
  }

  ngOnInit() {
    this.helper.message();
    this.get_list();

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;

    this.add_backup_detail = {
      start_date: null,
      end_date: null,
      is_deleted_from_db: false,
    };
  }

  get_list() {
    this.helper.http.post(  '/admin/list_database_backup', {}).subscribe(
      (data: any) => {
        this.myLoading = false;

        if (data.success == false) {
          this.backup_list = [];
        } else {
          this.backup_list = data.database_backup_list;
        }
      },
      (error: any) => {
        this.myLoading = false;
        this.helper.http_status(error);
      }
    );
  }

  restore(id) {
    this.helper.http
      .post('/admin/restore_database_backup', { id: id })
      .subscribe(
        (data) => {
          this.myLoading = false;
          this.get_list();
        },
        (error: any) => {
          this.myLoading = false;
          this.helper.http_status(error);
        }
      );
  }

  open_add_backup_modal() {
    this.modalService.open(this.add_backup_modal);
  }

  add_backup() {
    console.log(this.add_backup_detail);
    if (this.add_backup_detail.start_date && this.add_backup_detail.end_date) {
      this.helper.http
        .post('/admin/add_database_backup', this.add_backup_detail)
        .subscribe(
          (data) => {
            this.myLoading = false;
            this.activeModal.close();
            this.get_list();
          },
          (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error);
          }
        );
    }
  }
}
