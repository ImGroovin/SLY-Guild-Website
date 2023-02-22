import { Component, OnInit, OnDestroy } from '@angular/core';
declare function startLaunchAnimation(): void;
declare var animationActive: boolean;

@Component({
  selector: 'app-star-landing',
  templateUrl: './star-landing.component.html',
  styleUrls: ['./star-landing.component.css']
})
export class StarLandingComponent {
   
  ngOnDestroy() {
	animationActive = false;
  }

}
