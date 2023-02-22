import { Component, HostBinding, Host, ViewChildren } from '@angular/core';

import { StarMissionComponent } from '../star-mission/star-mission.component';
import { StarServicesComponent } from '../star-services/star-services.component';
import { StarWorkComponent } from '../star-work/star-work.component';

@Component({
  selector: 'app-star-loyal',
  templateUrl: './star-loyal.component.html',
  styleUrls: ['./star-loyal.component.css']
})
export class StarLoyalComponent {
  @HostBinding('class.component-wrapper') componentWrapper: Host = true;
  public complete = false;
  
  ngOnInit(): void {
    let bodyElem = document.querySelector('body');
	bodyElem!.classList.remove('dark-mode');
  }
  
  ngAfterViewChecked(): void {
	if (!this.complete) {
	  this.complete = true;
	  let targetElem = document.querySelector<HTMLElement>('#sly-wrapper');
	  targetElem!.scrollTop = 0;
	}
  }
}
