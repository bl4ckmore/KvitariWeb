import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPayment } from './public-payment';

describe('PublicPayment', () => {
  let component: PublicPayment;
  let fixture: ComponentFixture<PublicPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
