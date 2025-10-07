// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { Chart, registerables } from 'chart.js';

// Registrar todos los controladores de Chart.js
Chart.register(...registerables);

// Iniciar la aplicación
bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));
