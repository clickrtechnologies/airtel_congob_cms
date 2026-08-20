import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeLayoutComponent } from 'src/app/layout/home-layout/home-layout.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';


const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: '',redirectTo: 'home', pathMatch: 'full'  },
      { path: 'home', component: HomeComponent },
      {path : 'about', component : AboutUsComponent},
      {path : 'contact', component : ContactUsComponent} 

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRouteModule {}
