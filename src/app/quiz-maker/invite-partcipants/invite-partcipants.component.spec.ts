import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitePartcipantsComponent } from './invite-partcipants.component';

describe('InvitePartcipantsComponent', () => {
  let component: InvitePartcipantsComponent;
  let fixture: ComponentFixture<InvitePartcipantsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitePartcipantsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitePartcipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
