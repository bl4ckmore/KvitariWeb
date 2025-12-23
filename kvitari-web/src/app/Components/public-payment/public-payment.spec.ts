import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPaymentComponent } from './public-payment';

describe('PublicPayment', () => {
  let component: PublicPaymentComponent;
  let fixture: ComponentFixture<PublicPaymentComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicPaymentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
