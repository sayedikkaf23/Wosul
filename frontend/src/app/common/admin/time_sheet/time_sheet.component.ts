import { Component, OnInit } from '@angular/core';
import { Helper } from '../../../views/helper';

@Component({
  selector: 'time_sheet',
  templateUrl: 'time_sheet.template.html',
  styleUrls: ['./time_sheet.component.css'],
  providers: [Helper],
})
export class TimeSheetComponent implements OnInit {
  admin_id;
  is_open = false;
  is_play = true;
  is_pause = false;
  play = [];
  pause = [];
  duration;
  duration1;

  interval: any;
  time_sheet;
  constructor(public helper: Helper) {}
  ngOnInit() {
    this.admin_id = localStorage.getItem('admin_id');
    this.get_time_sheet();

    this.interval = setInterval(() => {
      if (this.time_sheet && this.time_sheet.is_play) {
        var end_time = new Date();
        var start_time = new Date(this.play[this.play.length - 1]);
        var diff_in_ms = end_time.getTime() - start_time.getTime();
        this.duration1 = new Date();
        this.duration1 = new Date(this.duration1.setHours(0, 0, 0));
        this.duration1 = new Date(
          this.duration1.getTime() + diff_in_ms + this.duration
        );
        this.duration1 = this.duration1.toLocaleTimeString();
        
        // console.log("timer>>>>>", this.duration1)
      }
    }, 1000);
  }

  get_time_sheet() {
    var date = new Date();
    date.toLocaleDateString();
    this.helper.http
      .post('/api/admin/get_time_sheet', {
        admin_id: this.admin_id,
        date: date.toLocaleDateString(),
      })

      .subscribe(
        (res_data: any) => {
          if (res_data.success == true) {
            this.time_sheet = res_data.time_sheet;
            this.duration1 = new Date();
            this.duration1 = new Date(this.duration1.setHours(0, 0, 0));
            this.duration1 = new Date(
              this.duration1.getTime() + res_data.time_sheet.duration
            );
            this.duration1 = this.duration1.toLocaleTimeString();
            this.set_duration(res_data);
          } else {
            this.time_sheet = null;
          }
        },
        (error: any) => {
          console.log('time err >>>');
        }
      );
  }
  set_duration(res_data: any) {
    this.play = res_data.time_sheet.play;
    this.pause = res_data.time_sheet.pause;

    if (res_data.time_sheet.is_play) {
      this.duration = res_data.time_sheet.duration;
      // console.log("duration", this.duration);
    }
  }
  timer_launch() {
    this.is_open = true;
    if (this.time_sheet) {
      if (this.time_sheet.is_play) {
        this.is_play = false;
        this.is_pause = true;
      }
      if (this.time_sheet.is_pause) {
        this.is_pause = false;
        this.is_play = true;
      }
    }
  }
  timer_close() {
    this.is_open = false;
  }
  play_pause() {
    var date = new Date();
    date.toLocaleDateString();
    if (this.is_play) {
      this.is_play = false;
      this.is_pause = true;
      this.helper.http
        .post('/api/admin/set_play_pause', {
          admin_id: this.admin_id,
          date: date.toLocaleDateString(),
          is_play: true,
          is_pause: false,
        })

        .subscribe(
          (res_data: any) => {
            if (res_data.success == true) {
              this.time_sheet = res_data.time_sheet;
              this.set_duration(res_data);
            }
          },
          (error: any) => {
            console.log('time err >>>');
          }
        );
    } else {
      this.duration = null;
      this.is_play = true;
      this.is_pause = false;
      this.helper.http
        .post('/api/admin/set_play_pause', {
          admin_id: this.admin_id,
          date: date.toLocaleDateString(),
          is_play: false,
          is_pause: true,
        })

        .subscribe(
          (res_data: any) => {
            if (res_data.success == true) {
              this.time_sheet = res_data.time_sheet;
              this.duration1 = new Date();
              this.duration1 = new Date(this.duration1.setHours(0, 0, 0));
              this.duration1 = new Date(
                this.duration1.getTime() + res_data.time_sheet.duration
              );
              this.duration1 = this.duration1.toLocaleTimeString();
              this.set_duration(res_data);
            }
          },
          (error: any) => {
            console.log('time err >>>');
          }
        );
    }
  }
}
