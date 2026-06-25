import { Component } from '@angular/core';
import { NavBlankComponent } from "../../components/nav-blank/nav-blank.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../components/footer/footer.component";
import { SidebarComponent } from "../../sidebar/sidebar.component";
import { ToastContainerComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-blank-layout',
  standalone: true,
  imports: [NavBlankComponent, RouterOutlet, FooterComponent, SidebarComponent, ToastContainerComponent],
  templateUrl: './blank-layout.component.html',
  styleUrl: './blank-layout.component.scss'
})
export class BlankLayoutComponent {

}
