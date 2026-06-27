import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  
  private readonly _AuthServiceService =inject(AuthServiceService)
  private readonly _formBuilder =inject(FormBuilder)
  private readonly _router =inject(Router)
  private readonly _route =inject(ActivatedRoute)
  
  
  
  msgError:string="";
  isLoading:boolean=false;
  showPassword:boolean=false;
  
  
  
  
 loginForm:FormGroup=this._formBuilder.group({
  email:[null,[Validators.required,Validators.email]],
  
  password:[null,[Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)]],
  
 
})
  //  loginForm:FormGroup =new FormGroup({
  // name:new FormControl(null,[Validators.required,Validators.minLength(3)]) ,
  // email:new FormControl(null,[Validators.required,Validators.email]),
  // phone:new FormControl(null,[Validators.required,Validators.pattern(/^01[0125][0-9]{8}$/)]),
  
  // password:new FormControl(null,[Validators.required,Validators.pattern(/^\w{6,}$/)]),
  
  // rePassword:new FormControl(null)
  
  // } ,this.confirmpassword)
  
  
  
 loginSubmit():void{
  if (this.loginForm.valid){
  
    this.isLoading=true;
    this._AuthServiceService.setloginForm(this.loginForm.value).subscribe({
      next:(res)=>{
      if (res.success && res.data?.token) {
          // Refresh the in-memory currentUser signal (roles included)
          // right away, instead of only writing localStorage - otherwise
          // the isAdmin()/hasRole() check just below would still see the
          // previous (anonymous) signal value until a manual refresh.
          this._AuthServiceService.persistSession(res.data.token, res.data.fullName, res.data.requirePasswordChange);

          if (res.data.requirePasswordChange) {
            this._router.navigate(['/auth/change-password']);
          } else {
            const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl');
            if (returnUrl) {
              this._router.navigateByUrl(returnUrl);
            } else if (this._AuthServiceService.isAdmin()) {
              this._router.navigate(['/admin/dashboard']);
            } else {
              this._router.navigate(['/home']);
            }
          }
        }
          this.isLoading=false;
  
      },
  
        error: (err: HttpErrorResponse) => {
        this.msgError = err.error.message;
        this.isLoading = false;
      }
    })
  }
  }
  
  
  
  
  
  
  
}

