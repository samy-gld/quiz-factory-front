import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[appPasswordMatch]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: passwordMatchDirective,
        multi: true
    }]
})

// tslint:disable-next-line:class-name
export class passwordMatchDirective implements Validator {
    @Input() appPasswordMatch: string;
    validate(control: AbstractControl): ValidationErrors | null {
        const compareField = control.parent.get(this.appPasswordMatch);
        if (compareField && control.value !== compareField.value) {
            return { noMatch: true };
        } else {
            return null;
        }
    }
}
