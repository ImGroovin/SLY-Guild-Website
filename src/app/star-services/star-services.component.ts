import { Component } from '@angular/core';

@Component({
  selector: 'app-star-services',
  templateUrl: './star-services.component.html',
  styleUrls: ['./star-services.component.css']
})
export class StarServicesComponent {
  serviceTitle: string = '';
  serviceDesc: string = '';
  serviceContext: string = '';
  serviceParticipant: string = '';
  serviceGC: string = '';
  serviceCC: string = '';
  servicesArr: { [key: string]: any }[] = [{}];
  
  ngOnInit(): void {
	this.servicesArr = [{'title': 'Education', 'desc': 'We view every interaction as a learning opportunity, and we enjoy sharing our knowledge and expertise with others. We produce game guides, walkthroughs, and statistics and make that information available to the public.', 'context': 'Metagame, In-game', 'participant': 'Public', 'gc': 'Time', 'cc': 'Free'}, {'title': 'Customization', 'desc': 'Our engineers appreciate the value of simple mechanisms and understand the intricacies of complex technologies. We can modify your weapon/vehicle/ship for aesthetics, customize them for power and efficiency, or reverse engineer them to provide a better understanding of how they function.', 'context': 'In-game', 'participant': 'Guild', 'gc': 'Design, Labor, Supplies', 'cc': 'Platform currency'}, {'title': 'Rescue', 'desc': 'SLY will get you out of a bad situation. We offer repair, refuel, and rescue services. Our specialists will ensure the safety of your crew and your assets while performing on-site repairs, as well as their safe return to non-combat space.', 'context': 'In-game', 'participant': 'Guild', 'gc': 'Labor, Supplies, Armament', 'cc': 'Platform currency'}, {'title': 'Salvage', 'desc': 'We believe that no material should go to waste. Our salvage experts will collect your scrap, refine the materials, and repurpose them.', 'context': 'In-game', 'participant': 'Guild', 'gc': 'Labor, Supplies, Armament', 'cc': 'Free'}]

	this.serviceTitle = this.servicesArr[0]['title'];
	this.serviceDesc = this.servicesArr[0]['desc'];
	this.serviceContext = this.servicesArr[0]['context'];
	this.serviceParticipant = this.servicesArr[0]['participant'];
	this.serviceGC = this.servicesArr[0]['gc'];
	this.serviceCC = this.servicesArr[0]['cc'];
  }

  selectService(event: MouseEvent, idx: number) {
    let item1: HTMLElement = <HTMLElement>document.querySelector('#services-card-1 div');
	item1.classList.remove('sly-card-selected');
	let servicesPanel: HTMLElement = <HTMLElement>document.querySelector('#services-panel');
	servicesPanel.classList.remove('expand', 'expand-again');
	setTimeout(() => {
		servicesPanel.classList.add('expand-again');
		const evtMsg = event ? (event.target as HTMLElement) : '';
		this.serviceTitle = this.servicesArr[idx]['title'];
		this.serviceDesc = this.servicesArr[idx]['desc'];
		this.serviceContext = this.servicesArr[idx]['context'];
		this.serviceParticipant = this.servicesArr[idx]['participant'];
		this.serviceGC = this.servicesArr[idx]['gc'];
		this.serviceCC = this.servicesArr[idx]['cc'];
	}, 10)
  }

}
