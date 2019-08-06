import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { IUser } from '../../model/IUser';
import { ErrorManagerService } from '../../services/error-manager.service';

@Component({
    selector: 'app-confirm-register',
    templateUrl: './confirm-register.component.html',
    styleUrls: ['./confirm-register.component.css']
})
export class ConfirmRegisterComponent implements OnInit {
    success: boolean;
    loaded = false;
    username: string;

    constructor(private activatedRoute: ActivatedRoute,
                private authenticationService: AuthenticationService,
                private errorManager: ErrorManagerService) { }

    ngOnInit() {
        const token = this.activatedRoute.snapshot.params.token;
        this.authenticationService.confirmToken(token).subscribe(
            (user: IUser) => {
                this.success = true;
                this.username = user.username;
            },
            error => {
                this.success = false;
                this.errorManager.manageError(error);
            },
            () => this.loaded = true
        );
    }
}
