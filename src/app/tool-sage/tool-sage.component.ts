import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-tool-sage',
  templateUrl: './tool-sage.component.html',
  styleUrls: ['./tool-sage.component.css']
})
export class ToolSageComponent implements AfterViewInit {
  public tmpResp:any;
  displayedColumns = ['acct', 'pzCnt', 'dailyPzCnt', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  displayedPrizeColumns : any[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  dataSource!: MatTableDataSource<any>;
  dispAmmoTotal! : '';
  dispFoodTotal! : '';
  dispFuelTotal! : '';
  dispToolTotal! : '';
  
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor( private http : HttpClient ) {}
  
  ngOnInit(): void {
  
    this.http.get('/api/sageev')
    .subscribe(Response => {
		this.tmpResp = Response;
		let ev = this.tmpResp;
		let formattedData : any[] = [];
		for (const account of ev) {
			let formattedItem = {};
			
			formattedItem['acct'] = account.acct;
			formattedItem['pzCnt'] = account.pzCnt;
			formattedItem['dailyPzCnt'] = account.prizes24hr;
			for (const [keyPrizes, valuePrizes] of Object.entries(account.prizes)) {
				// formattedItem[keyPrizes] = JSON.stringify(valuePrizes, undefined, 2);
				formattedItem[keyPrizes] = valuePrizes;
				if (!this.displayedPrizeColumns.includes(keyPrizes)) {
					this.displayedPrizeColumns.push(keyPrizes);
					this.displayedColumns.push(keyPrizes);
				}
				/*
				if (!this.displayedColumns.includes(keyPrizes)) {
					this.displayedColumns.push(keyPrizes);
				}
				*/
			}
			formattedData.push(formattedItem);
		}
		
		this.dispAmmoTotal = ev.reduce((acc, o) => {let oAmmo = o.prizes24hr && o.prizes24hr.Ammo ? o.prizes24hr.Ammo : 0; return acc + oAmmo}, 0)
		this.dispFoodTotal = ev.reduce((acc, o) => {let oFood = o.prizes24hr && o.prizes24hr.Food ? o.prizes24hr.Food : 0; return acc + oFood}, 0)
		this.dispFuelTotal = ev.reduce((acc, o) => {let oFuel = o.prizes24hr && o.prizes24hr.Fuel ? o.prizes24hr.Fuel : 0; return acc + oFuel}, 0)
		this.dispToolTotal = ev.reduce((acc, o) => {let oTool = o.prizes24hr && o.prizes24hr.Toolkits ? o.prizes24hr.Toolkits : 0; return acc + oTool}, 0)
		
		this.dataSource = new MatTableDataSource(formattedData);
		this.dataSource.filterPredicate = (data: any, filter: string) => {
			const dataStr = JSON.stringify(data).toLowerCase();
			return dataStr.indexOf(filter) != -1;
		}
		this.dataSource.paginator = this.paginator;
		this.dataSource.sortingDataAccessor = (item, property) => {
			switch(property) {
				case 'dailyPzCnt': return item.dailyPzCnt ? item.dailyPzCnt.tierCnt : 0;
				case 'common': return item.common ? item.common.tierCnt : 0;
				case 'uncommon': return item.uncommon ? item.uncommon.tierCnt : 0;
				case 'rare': return item.rare ? item.rare.tierCnt : 0;
				case 'epic': return item.epic ? item.epic.tierCnt : 0;
				case 'legendary': return item.legendary ? item.legendary.tierCnt : 0;
				default: return item[property];
			}
		};
		this.dataSource.sort = this.sort;
	});
  
  }
  
  ngAfterViewInit() {
  //  this.dataSource.paginator = this.paginator;
  }
  
  applyFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
}
