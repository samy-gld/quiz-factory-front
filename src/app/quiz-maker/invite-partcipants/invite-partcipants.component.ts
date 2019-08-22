import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-invite-partcipants',
  templateUrl: './invite-partcipants.component.html',
  styleUrls: ['./invite-partcipants.component.css']
})
export class InvitePartcipantsComponent implements OnInit {
  @Output() closeInvite: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

}
