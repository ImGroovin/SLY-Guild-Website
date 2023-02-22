import { Component, HostBinding, ViewChildren, ElementRef, AfterViewInit, QueryList } from '@angular/core';
import { Location } from '@angular/common'; 
import { FormControl } from '@angular/forms';
import { Router, Data, RouterEvent, ActivationEnd } from '@angular/router';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

import { StarLoyalComponent } from './star-loyal/star-loyal.component';
import { StarMissionComponent } from './star-mission/star-mission.component';
import { StarServicesComponent } from './star-services/star-services.component';
import { StarWorkComponent } from './star-work/star-work.component';
import { ShadowLandingComponent } from './shadow-landing/shadow-landing.component';
import { ShadowLoyalComponent } from './shadow-loyal/shadow-loyal.component';
declare function startLaunchAnimation(): void;
declare var animationActive: boolean;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Star Loyal';
  toggleControl = new FormControl(false);
  isDark = false;
  glitch = true;
  bodyElem = document.querySelector('body');
  @ViewChildren('myMenuItem') menuItemRef!: QueryList<ElementRef>;
  @ViewChildren('mainContent') mainContentDiv!: QueryList<ElementRef>;
  
  options: AnimationOptions = {    
    path: '/assets/animations/logo-black_to_white.json'  
  };
  
  private animationItem!: AnimationItem;
  
  animationCreated(animationItem: AnimationItem): void {
    this.animationItem = animationItem;
  }
  
  setNavTitle(title: string, id: string) {
	  this.title = title;
	  this.location.replaceState(this.location.path() + '#' + id);
	  if (title === 'Star Loyal') {
		animationActive = true;
		let anim = new startLaunchAnimation();
		anim.animatePix();
	  } else {
		animationActive = false
	  }
  };
  
  setDark(darkMode: boolean, glitch: boolean) {
    this.glitch = glitch;
	this.toggleControl.setValue(true);
  };
 
  scrollToSection(event: MouseEvent, target: string) {
	let scrollElem: HTMLElement = <HTMLElement>document.getElementById('sly-wrapper');
	let scrollTarget: HTMLElement = <HTMLElement>document.getElementById(target);
	let targetPos = 0;
	if (scrollTarget.offsetTop > 0 && scrollElem.clientHeight > scrollTarget.offsetTop) {
		targetPos = (scrollElem.clientHeight + scrollTarget.offsetTop) * 0.9;
	} else {
		targetPos = scrollTarget.offsetTop;
	}
	setTimeout(() => {
		scrollElem.scrollTo({top: targetPos, left: 0, behavior: 'smooth'});
	}, 100)
  }
  
  constructor(private router: Router, private location: Location) {
    this.options = {
      ...this.options,
	  loop: false,
	  autoplay: false,
      path: '/assets/animations/logo-black_to_white.json',
    };
	this.toggleControl.valueChanges.subscribe((darkMode) => {
	  const darkClassName = 'dark-mode';
	  let bgElem = document.querySelector<HTMLElement>('#bg-circle');
	  let bgSectionElem = document.querySelector<HTMLElement>('#section-bg');
	  let glitchTargets = document.querySelectorAll<HTMLElement>('.glitch-target');
	  if (this.bodyElem && bgElem) {
	    if (darkMode) {
		  this.isDark = true;
		  this.animationItem.setDirection(1);
		  this.animationItem.play();
		  bgElem.classList.remove('bg-expand');
		  bgElem.classList.add('bg-collapse');
		  if(bgSectionElem) {
			bgSectionElem.classList.remove('bg-expand-delayed');
			bgSectionElem.classList.add('bg-collapse-delayed');
		  }
		  this.bodyElem.classList.add('dark-mode');
		  if (this.glitch) {
			  setTimeout(() => {
				glitchTargets.forEach(el => el.classList.add('glitch'));
				setTimeout(() => {
					this.router.navigate(['shadow-loyal']);
					glitchTargets.forEach(el => el.classList.remove('glitch'));
				}, 4000)
			  }, 1000)
		  }
		} else {
		  this.isDark = false;
		  this.animationItem.setDirection(-1);
		  this.animationItem.play();
		  bgElem.classList.remove('bg-collapse');
		  bgElem.classList.add('bg-expand');
		  setTimeout(() => {
		    this.router.navigate(['star-loyal']);
		    this.bodyElem!.classList.remove('dark-mode');
	      }, 800)
		}
	  }
	  this.glitch = true;
	});
	
    router.events.subscribe((val) => {
	  if (val instanceof ActivationEnd) {
		this.title = val.snapshot.data['navTitle'];
	  }
	});
  }
  
  ngAfterViewInit(): void {
	//console.log(this.menuItemRef);
	this.menuItemRef.changes.subscribe(() => {
      console.log(this.menuItemRef);
    });
  }
}
