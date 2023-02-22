import { Component, HostBinding, Host } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-shadow-loyal',
  templateUrl: './shadow-loyal.component.html',
  styleUrls: ['./shadow-loyal.component.css']
})
export class ShadowLoyalComponent {
  @HostBinding('class.component-wrapper') componentWrapper: Host = true;
  public complete = false;
  
  constructor( private app : AppComponent ) {}
  
  ngOnInit(): void {
    setTimeout(() => {
      this.app.setDark(true, false);
	}, 1000)
  }
  
  ngAfterViewChecked(): void {
	if (!this.complete) {
	  this.complete = true;
	  let targetElem = document.querySelector<HTMLElement>('#sly-wrapper');
	  targetElem!.scrollTop = 0;
	}
  }
}
