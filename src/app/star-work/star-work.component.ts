import { Component } from '@angular/core';

@Component({
  selector: 'app-star-work',
  templateUrl: './star-work.component.html',
  styleUrls: ['./star-work.component.css']
})
export class StarWorkComponent {
  workStyle: string = '';

  ngOnInit(): void {
    this.workStyle = 'posCenter';
  }
  
  workSelect(event: MouseEvent, idx: number) {
	const evtMsg = event ? (event.target as HTMLElement) : '';
	let item1: HTMLElement = <HTMLElement>document.getElementById('item1');
	let item2: HTMLElement = <HTMLElement>document.getElementById('item2');
	let item3: HTMLElement = <HTMLElement>document.getElementById('item3');
	item1.classList.remove('posLeft', 'posRight', 'posCenter');
	item2.classList.remove('posLeft', 'posRight', 'posCenter');
	item3.classList.remove('posLeft', 'posRight', 'posCenter');
	console.log(idx);
	if (idx === 1) {
	  item1.classList.add('posCenter');
	  item2.classList.add('posRight');
	  item3.classList.add('posLeft');
	} else if (idx === 2) {
	  item2.classList.add('posCenter');
	  item1.classList.add('posLeft');
	  item3.classList.add('posRight');
	} else {
	  item3.classList.add('posCenter');
	  item2.classList.add('posLeft');
	  item1.classList.add('posRight');
	}
  }
}
