import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtpServerComponent } from './ftp_server.component';

describe('FtpServerComponent', () => {
  let component: FtpServerComponent;
  let fixture: ComponentFixture<FtpServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtpServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtpServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
