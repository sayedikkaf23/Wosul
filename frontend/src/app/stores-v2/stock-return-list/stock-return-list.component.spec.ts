import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockReturnListComponent } from './stock-return-list.component';

describe('StockReturnListComponent', () => {
  let component: StockReturnListComponent;
  let fixture: ComponentFixture<StockReturnListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockReturnListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
