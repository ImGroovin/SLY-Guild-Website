import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-tool-sage',
  templateUrl: './tool-sage.component.html',
  styleUrls: ['./tool-sage.component.css']
})
export class ToolSageComponent implements AfterViewInit {
  public tmpResp:any;
  displayedColumns = ['acct', 'pzCnt'];
  displayedPrizeColumns : any[] = [];
  dataSource!: MatTableDataSource<any>;
  
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor( private http : HttpClient ) {}
  
  ngOnInit(): void {
    //let ev: Array = [];
	//ev = [
    //  {account: "E9iWzYDuPUApcgqPDgbBfinzWWRpWHxzpdQq49kSHGzG", data: "test"}
    //];
	//this.dataSource = new MatTableDataSource(ev);
  
    this.http.get('/api/sageev')
    .subscribe(Response => {
		this.tmpResp = Response;
		let ev = this.tmpResp;
		let formattedData : any[] = [];
		for (const account of ev) {
			let formattedItem = {};
			
			formattedItem['acct'] = account.acct;
			formattedItem['pzCnt'] = account.pzCnt;
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
		this.dataSource = new MatTableDataSource(formattedData);
		this.dataSource.paginator = this.paginator;
		this.dataSource.sortingDataAccessor = (item, property) => {
			switch(property) {
				case 'common': return item.common ? item.common.tierCnt : 0;
				case 'uncommon': return item.uncommon ? item.uncommon.tierCnt : 0;
				case 'rare': return item.rare ? item.rare.tierCnt : 0;
				case 'epic': return item.epic ? item.epic.tierCnt : 0;
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
    let filterValue = (event.target as HTMLInputElement).value.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}
