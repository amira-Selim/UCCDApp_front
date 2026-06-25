import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { AuthServiceService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const rePassword = control.get('rePassword')?.value;

  if (password && rePassword && password !== rePassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
private readonly _AuthServiceService =inject(AuthServiceService)
private readonly _formBuilder =inject(FormBuilder)
private readonly _router =inject(Router)
private readonly _notification =inject(NotificationService)

msgError:string="";
msgSuccess:string="";
isLoading:boolean=false;

// Toggles for showing/hiding passwords
showPassword = false;
showRePassword = false;

registerForm:FormGroup=this._formBuilder.group({
firstName:[null,[Validators.required,Validators.minLength(3)]],
lastName:[null,[Validators.required,Validators.minLength(3)]],
email:[null,[Validators.required,Validators.email]],

password: [null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,15}$/)]],
rePassword: [null, [Validators.required]],

phoneNumber:[null,[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)]]

}, { validators: passwordMatchValidator })
// }, {Validators:this.confirmpassword})

//   registerForm:FormGroup =new FormGroup({
// name:new FormControl(null,[Validators.required,Validators.minLength(3)]) ,
// email:new FormControl(null,[Validators.required,Validators.email]),
// phone:new FormControl(null,[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)]),

// password:new FormControl(null,[Validators.required,Validators.pattern(/^\w{6,}$/)]),

// rePassword:new FormControl(null)

// } ,this.confirmpassword)



registerSubmit():void{
if (this.registerForm.valid){

  this.isLoading=true;
  this._AuthServiceService.setRegisterForm(this.registerForm.value).subscribe({
    next:(res)=>{
      console.log(res)
    if (res.token) {
          this.msgSuccess = "Account created successfully! Redirecting to login...";
          this._notification.success('Account created successfully!');
          setTimeout(() => {
            // نمرر بيانات تسجيل الدخول للصفحة القادمة
            this._router.navigate(['/auth/login'], { 
              state: { email: res.email, password: this.registerForm.value.password } 
            });
          }, 2000);
        }
        this.isLoading=false;

    },

     error: (err: HttpErrorResponse) => {
        console.log('Registration error:', err);
        
        // Extract specific validation errors if they exist (ASP.NET Core ValidationProblemDetails)
        if (err.error?.errors && typeof err.error.errors === 'object') {
          const errorMessages = Object.values(err.error.errors).flat();
          this.msgError = errorMessages.join(' | ');
        } else {
          // Safe error extraction to handle different backend structures
          this.msgError = err.error?.message || err.error?.title || 'An error occurred during registration. Please try again.';
        }
        
        this.isLoading = false;
      }
  })
  console.log(this.registerForm.value)
} else {
  this.registerForm.markAllAsTouched();
}
}


//  confirmpassword(g:AbstractControl ){
//   if(g.get('password')?.value === g.get('rePassword')?.value)
// {
//     return null
//   }
//   else{
//     return{ mismatch:true }
//   }
//  }





}
