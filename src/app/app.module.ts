import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { AnimateOnScrollModule } from './aos/animate-on-scroll.module';

import { AppComponent } from './app.component';
import { StarMissionComponent } from './star-mission/star-mission.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StarServicesComponent } from './star-services/star-services.component';
import { StarWorkComponent } from './star-work/star-work.component';
import { StarLandingComponent } from './star-landing/star-landing.component';
import { ShadowLandingComponent } from './shadow-landing/shadow-landing.component';
import { ShadowMembershipComponent } from './shadow-membership/shadow-membership.component';
import { StarLoyalComponent } from './star-loyal/star-loyal.component';
import { ShadowLoyalComponent } from './shadow-loyal/shadow-loyal.component';
import { ShadowOpsComponent } from './shadow-ops/shadow-ops.component';
import { ShadowCodeComponent } from './shadow-code/shadow-code.component';
import { ToolSageComponent } from './tool-sage/tool-sage.component';

export function playerFactory(): any {  
  return import('lottie-web');
}

@NgModule({
  declarations: [
    AppComponent,
    StarMissionComponent,
    StarServicesComponent,
    StarWorkComponent,
    StarLandingComponent,
    ShadowLandingComponent,
    ShadowMembershipComponent,
    StarLoyalComponent,
    ShadowLoyalComponent,
    ShadowOpsComponent,
    ShadowCodeComponent,
    ToolSageComponent,
  ],
  imports: [
    BrowserModule,
	HttpClientModule,
	CommonModule,
	FormsModule,
	ReactiveFormsModule,
	MatToolbarModule,
	MatSlideToggleModule,
	MatMenuModule,
	MatIconModule,
	MatCardModule,
	MatListModule,
	MatTableModule,
	MatPaginatorModule,
	MatSortModule,
	MatFormFieldModule,
	MatInputModule,
	LottieModule.forRoot({ player: playerFactory }),
	AnimateOnScrollModule.forRoot(),
	RouterModule.forRoot([
		{path: 'star-loyal', title: 'Star Loyal', component: StarLoyalComponent, data: {navTitle: 'Star Loyal'}},
		{path: 'shadow-loyal', title: 'Shadow Loyal', component: ShadowLoyalComponent, data: {navTitle: 'Shadow Loyal'}},
		{path: 'tool-sage', title: 'SAGE:EV', component: ToolSageComponent, data: {navTitle: 'SAGE:EV'}},
		{path: '',   redirectTo: '/star-loyal', pathMatch: 'full'},
		{path: '**', component: StarLoyalComponent},
		/*{path: 'star-mission', title: 'Mission', component: StarMissionComponent, data: {navTitle: 'Mission'}},
		{path: 'star-services', title: 'Services', component: StarServicesComponent, data: {navTitle: 'Services'}},
		{path: 'star-work', title: 'Work', component: StarWorkComponent, data: {navTitle: 'Our Work'}},
		{path: 'shadow-loyal', title: 'Shadow Loyal', component: ShadowLoyalComponent, data: {navTitle: 'Shadow Loyal'}},
		{path: 'shadow-landing', title: 'Landing', component: ShadowLandingComponent, data: {navTitle: 'Shadow Landing'}},
		{path: 'shadow-membership', title: 'Landing', component: ShadowMembershipComponent, data: {navTitle: 'Guild Membership'}},*/
	]),
 BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
