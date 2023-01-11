import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
 
import { Helper } from '../../helper';
export interface CreateGroupNotification {
  group_id : string,
  message_title : string,
  message_heading : string,

}
@Component({
  selector: 'app-group-notification',
  templateUrl: './group-notification.component.html',
  styleUrls: ['./group-notification.component.css'],
  providers: [Helper],
})
export class GroupNotificationComponent implements OnInit {
  @ViewChild('myModal') modal: any;
  @ViewChild('updateModal') updateModal: any;
  title: any;
  button: any;
  heading_title: any;
  validation_message: any;
  DATE_FORMAT: any;
  create_group_notification
  formData = new FormData();
  group_list;
  group_name = '';
  image_url = "";
  users_no = ""
  modal_title;
  isEdit = false;
  myLoading = false
  edit_id;
  constructor(
    public helper: Helper,
    public vcr: ViewContainerRef,
    private modalService: NgbModal,
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.validation_message = this.helper.validation_message;
    this.DATE_FORMAT = this.helper.DATE_FORMAT;
    this.create_group_notification = {
    }
    this.getGroup()
  }
  open_modal(){
    this.isEdit = false;
    this.users_no = null;
    this.group_name = null
    this.modal_title = "Add New Group"
    this.modalService.open(this.modal);
  }
  addGroup(data){
    console.log(data.invalid)
    console.log(data.value)
    if(!data.invalid){
      var pay_load = data.value
      pay_load.users_no = pay_load.users_no.replace(/ /g, '')
      pay_load.users_no = pay_load.users_no.split(",")
        this.helper.http.post(  '/admin/add_notification_group', pay_load).subscribe((resp : any)=>{
          console.log(">>>", resp)
          if(resp.success){
            data.reset()
            this.getGroup()
            this.modalService.dismissAll()
          }
        })

      console.log(pay_load)
  

    }else{
      console.log(">>>>")
    }
 
  }

  getGroup(){
    console.log(">>>")
    this.helper.http.post(  '/admin/get_notification_group', null).subscribe(
      (resp : any)=>{
        if(resp.success){
          console.log(">>>", resp)
          this.group_list = resp['data'] 
        }
      }
    )

  }
  openEdit(group){
    this.isEdit = true
    this.modal_title = "Update Group"
    this.modalService.open(this.modal);
    this.group_name = group.group_name;
    this.edit_id = group._id
    console.log(group)
    this.users_no = group.users_phone.join(',')
  }
  editGroup(data){
    console.log(data)
  }
  send_group_notification(data){
    console.log(data)
    this.myLoading = true
    if(!data.invalid){
      let pay_load = data.value;
      pay_load.image_url = this.image_url
      console.log(pay_load);
      this.helper.http.post(  '/admin/send_group_notification', pay_load).subscribe((resp : any)=>{
        if(resp.success){
        this.myLoading = false
          data.reset()
        }
      })

    }
  
  
  }

  image_update($event){
    // console.log('$event :>> ', $event);
    const files = $event.target.files || $event.srcElement.files;
    const image_url = files[0];
    console.log('files :>> ', files);
    if(files.length !=0){
      if(image_url.size < 950000){
        var reader = new FileReader();
        reader.onload = (e: any) => {
          this.image_url = e.target.result
          this.upload_image(image_url)
        };
        reader.readAsDataURL(image_url);
      }
      else{
        console.log('image size is too large :>> ');
        this.helper.data.storage = {
          message: "Image size must be less than 1 MB",
          class: 'alert-danger',
        };
        this.helper.message();
      }
      }
  }
  upload_image(file){
    let uploadData = new FormData()
    this.myLoading = true
    uploadData.append("image_url", file)
    uploadData.append("type", 'group_')
    this.helper.http.post('/admin/upload_notification_img', uploadData).subscribe((res :any )=>{
      if(res.success){
        setTimeout(()=>{ this.image_url = res.url
          this.myLoading = false
        }, 800)
      }else{
        this.myLoading = false
      }
    })
  }
}

