import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'centerProject';

  // Injecting (rather than just declaring as providedIn:'root' singletons
  // used elsewhere) forces both services to construct - and apply the
  // persisted theme/dir attributes to <html> - as soon as the app boots,
  // instead of waiting for the first component that happens to use them.
  private readonly _theme = inject(ThemeService);
  private readonly _lang = inject(LanguageService);
}
