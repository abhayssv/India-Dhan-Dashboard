import 'zone.js'; // Angular needs this
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // includes Popper; keep ONLY this
import 'bootstrap/dist/js/bootstrap.esm.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
