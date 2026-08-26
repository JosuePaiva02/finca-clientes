import { Routes } from '@angular/router';
const baseTitle = 'Finca Verde';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/presentation/components/layout/home-component/home-component.component')
        .then(m => m.HomeComponentComponent),
    title: `${baseTitle} - Inicio`
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./properties/presentation/components/property-detail/property-detail.component')
        .then(m => m.PropertyDetailComponent),
    title: `${baseTitle} - Propiedad`
  },

  {
    path: 'browse',
    loadComponent: () =>
      import('./browse/presentation/components/layout/browse/browse.component')
         .then(m => m.BrowseComponent),
    title: `${baseTitle} - Catalogo`
  },

  {
    path: 'selling',
    loadComponent: () =>
      import('./selling/presentation/components/layout/selling-component/selling-component.component')
        .then(m => m.SellingComponentComponent),
    title: `${baseTitle} - => Vender`
  },

  {
    path: 'testimonies',
    loadComponent: () =>
      import('./testimonies/presentation/components/layout/testimonies-component/testimonies-component.component')
        .then(m => m.TestimoniesComponent),
    title: `${baseTitle} - => Testimonies`
  },

  {
    path: '**',
    redirectTo: 'home'
  }

];
