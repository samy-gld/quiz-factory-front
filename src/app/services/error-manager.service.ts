import { Injectable } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {AuthenticationService} from '../authentication/services/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class ErrorManagerService {

    constructor(private toastr: ToastrService,
                private router: Router,
                private authenticationService: AuthenticationService) {
    }

    manageError(error) {
        const message = error.error.message;
        switch (message) {
            case 'Quiz not found':
                this.toastr.error('Le quiz demandé n\'a pas été trouvé');
                break;
            case 'Email already used':
                this.toastr.error('Cette adresse email est déjà utilisée');
                break;
            case 'Username already used':
                this.toastr.error('Nom déjà utilisé');
                break;
            case 'Expired JWT Token':
                this.toastr.error('Votre session a expiré');
                this.authenticationService.isAuthenticated.next(false);
                this.router.navigate(['/login']);
                break;
            case 'No user with this confirmation token':
                this.toastr.error('Il y a une erreur dans le lien de confirmation. Ou peut-être que le compte a déjà été validé, essayer de vous connecter...');
                break;
            case 'Bad credentials':
                this.toastr.error('Les données de connexion sont incorrectes');
                break;
            default:
                this.toastr.error(message);
        }
    }

}
