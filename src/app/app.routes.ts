import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { BlankLayoutComponent } from './layouts/blank-layout/blank-layout.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { register } from 'module';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import path from 'path';
import { Component } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutComponent } from './components/about/about.component';
import { ServicesComponent } from './components/services/services.component';
import { CartComponent } from './components/cart/cart.component';
import { VolunteringComponent } from './components/voluntering/voluntering.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { ManagementComponent } from './components/management/management.component';
import { CoursesComponent } from './components/courses/courses.component';
import { WorkshopsComponent } from './components/workshops/workshops.component';
import { NavBlankComponent } from './components/nav-blank/nav-blank.component';
import { SignoutComponent } from './components/signout/signout.component';
import { LeaderWordComponent } from './components/leader-word/leader-word.component';
import { CenterBirthComponent } from './components/center-birth/center-birth.component';
import { CenterGoalsComponent } from './components/center-goals/center-goals.component';
import { WishListComponent } from './components/wish-list/wish-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { StudentProfileComponent } from './components/student-profile/student-profile.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { ADMIN_ROUTES } from './admin/admin.routes';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { profileGuard } from './core/guards/profile.guard';
import { UnauthorizedComponent } from './admin/pages/unauthorized/unauthorized.component';

export const routes: Routes = [



{ path: '', redirectTo: 'home', pathMatch: 'full' }
,
{path:'auth' ,component:AuthLayoutComponent,
    children:[
        
        {path:'register', component:RegisterComponent},
        {path:'login',component:LoginComponent},
        {path:'forgot-password', loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)},
        {path:'reset-password', loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)},
              

    ]
},
{path:'' ,component:BlankLayoutComponent
    ,children:[
{        path:'' ,component:HomeComponent
},
{        path:'home',component:HomeComponent
}  ,
{        path:'wish-list',component:WishListComponent
}  ,
{        path:'contact',component:ContactComponent
} ,
{        path:'about',component:AboutComponent
} ,

{        path:'volunteering',component:VolunteringComponent
} 
,
{        path:'profile',component:ProfileComponent, canActivate: [authGuard]
} 
,
{        path:'courses',component:CoursesComponent
} 

,
{        path:'workshops',component:WorkshopsComponent
} 
,
{        path:'jobs',component:JobsComponent, canActivate: [profileGuard]
}
,
{        path:'showStudent',component:StudentProfileComponent, canActivate: [authGuard]
} ,
{        path:'student-profile',component:StudentProfileComponent, canActivate: [authGuard]
} ,

{        path:'signout',component:SignoutComponent 
} 
,

  ]
},
{
  path: 'admin',
  component: AdminLayoutComponent,
  canActivate: [adminGuard],
  canMatch: [adminGuard],
  children: ADMIN_ROUTES
},
{ path: 'unauthorized', component: UnauthorizedComponent },
{path:'**' ,component:NotfoundComponent}

];
