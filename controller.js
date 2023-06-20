const solanaWeb3 = require('@solana/web3.js');
const anchor = require("@coral-xyz/anchor");
const CyclicDb = require("@cyclic.sh/dynamodb");
const { UpdateCommand, QueryCommand, DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const data = require("./data");

const idl = JSON.parse('{"version":"0.1.0","name":"escape_velocity","instructions":[{"name":"changeLockAmount","accounts":[{"name":"owner","isMut":false,"isSigner":true},{"name":"game","isMut":false,"isSigner":false}],"args":[{"name":"lockAmount","type":"u64"}]},{"name":"createFleet","accounts":[{"name":"fleetOwner","isMut":false,"isSigner":true},{"name":"fleet","isMut":true,"isSigner":true},{"name":"game","isMut":false,"isSigner":false},{"name":"funder","isMut":true,"isSigner":true},{"name":"userTokenAccount","isMut":true,"isSigner":false},{"name":"fleetSigner","isMut":false,"isSigner":false},{"name":"fleetLockAccount","isMut":true,"isSigner":false},{"name":"lockMint","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"rent","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"associatedTokenProgram","isMut":false,"isSigner":false}],"args":[{"name":"representation","type":"publicKey"}]},{"name":"createGame","accounts":[{"name":"owner","isMut":false,"isSigner":false},{"name":"game","isMut":true,"isSigner":true},{"name":"funder","isMut":true,"isSigner":true},{"name":"lockMint","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"lockAmount","type":"u64"},{"name":"defaultStats","type":{"defined":"FleetStatsUnpacked"}}]},{"name":"disbandFleet","accounts":[{"name":"fleetOwner","isMut":false,"isSigner":true},{"name":"fleet","isMut":true,"isSigner":false},{"name":"game","isMut":false,"isSigner":false},{"name":"funder","isMut":true,"isSigner":false},{"name":"userTokenAccount","isMut":true,"isSigner":false},{"name":"fleetSigner","isMut":false,"isSigner":false},{"name":"fleetLockAccount","isMut":true,"isSigner":false},{"name":"lockMint","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false}],"args":[]},{"name":"goToWarp","accounts":[{"name":"owner","isMut":false,"isSigner":true},{"name":"fleet","isMut":true,"isSigner":false},{"name":"funder","isMut":true,"isSigner":true},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"to","type":{"array":["i64",2]}}]}],"accounts":[{"name":"Fleet","type":{"kind":"struct","fields":[{"name":"version","docs":["The data version of the fleet"],"type":"u8"},{"name":"game","docs":["The game this fleet is in"],"type":"publicKey"},{"name":"owner","docs":["The owner of the fleet"],"type":"publicKey"},{"name":"lastWarpStart","docs":["The last time this fleet warped"],"type":"i64"},{"name":"lastWarpEnd","docs":["When the last warp will end"],"type":"i64"},{"name":"representation","docs":["The representation object of the fleet"],"type":"publicKey"},{"name":"stats","docs":["The stats of the fleet"],"type":{"defined":"FleetStats"}}]}},{"name":"Game","type":{"kind":"struct","fields":[{"name":"version","type":"u8"},{"name":"owner","type":"publicKey"},{"name":"lockMint","type":"publicKey"},{"name":"lockAmount","type":"u64"},{"name":"defaultStats","type":{"defined":"FleetStats"}}]}}],"types":[{"name":"Disbanded","type":{"kind":"struct","fields":[]}},{"name":"FleetStats","type":{"kind":"struct","fields":[{"name":"warpSpeed","docs":["cAU per second, 1:10000"],"type":"u32"},{"name":"warpCooldown","docs":["Time in seconds to wait until can warp again"],"type":"i64"},{"name":"warpRange","docs":["AU, 1:10000"],"type":"u32"}]}},{"name":"FleetStatsUnpacked","docs":["Unpacked version of [`FleetStats`]"],"type":{"kind":"struct","fields":[{"name":"warpSpeed","docs":["cAU per second, 1:10000"],"type":"u32"},{"name":"warpCooldown","docs":["Time in seconds to wait until can warp again"],"type":"i64"},{"name":"warpRange","docs":["AU, 1:10000"],"type":"u32"}]}},{"name":"Idle","type":{"kind":"struct","fields":[{"name":"sector","type":{"array":["i64",2]}}]}},{"name":"Warp","type":{"kind":"struct","fields":[{"name":"from","type":{"array":["i64",2]}},{"name":"to","type":{"array":["i64",2]}},{"name":"departureTime","type":"i64"},{"name":"arrivalTime","type":"i64"}]}}],"errors":[{"code":6000,"name":"InvalidFleetState"},{"code":6001,"name":"WarpCooldownNotExpired"},{"code":6002,"name":"WarpRangeExceeded"}]}');

const db = CyclicDb("cooperative-wasp-turtleneck-shirtCyclicDB");
const dbAccounts = db.collection("accounts");
const ddbClient = new DynamoDBClient({ region: 'us-east-2' });
const HTTP_ENDPOINT = 'https://solana-api.syndica.io/access-token/WPoEqWQ2auQQY1zHRNGJyRBkvfOLqw58FqYucdYtmy8q9Z84MBWwqtfVf8jKhcFh/rpc';
const solanaConnection = new solanaWeb3.Connection(HTTP_ENDPOINT);

class Controller {
	dbData;
	totalStart = Date.now();
	
	async getEVPrizes(address, recentPrizeTS) {
	//const getEVPrizes = async(address, recentPrizeTS) => {
		let prizes = [];

		try {
			let prizesRaw = await fetch(`https://galaxy.staratlas.com/prizes/${address}`);
			prizes = await prizesRaw.json();
		} catch(e) {
			console.log(e);
		}

		
		//let prizeTotals = prizes.reduce(function (r, row) {
		//	r[row.name] = r[row.name] + row.quantity || row.quantity;
		//	return r;
		//}, {});

		let prizeTotals = {};
		let prizeCnt = 0;
		let newRecentTS = 0;
		
		for (let prize of prizes) {
			newRecentTS = prize.discoverTimestamp > newRecentTS ? prize.discoverTimestamp : newRecentTS;
			if (prize.discoverTimestamp > recentPrizeTS) {
				if (prize.rarity in prizeTotals) {
					prizeTotals[prize.rarity].tierCnt++;
				} else {
					prizeTotals[prize.rarity] = {tierCnt: 1};
				}
				if (prize.name in prizeTotals[prize.rarity]) {
					prizeTotals[prize.rarity][prize.name] += prize.quantity;
				} else {
					prizeTotals[prize.rarity][prize.name] = prize.quantity;
				}
				prizeCnt++;
			}
		}
		
		//console.log({recentTS: newRecentTS, count: prizeCnt, prizes: prizeTotals});
		return {recentTS: newRecentTS, count: prizeCnt, prizes: prizeTotals};
	}

	async addEntry(evAccount, evAccountData) {
	//const addEntry = async(evAccount, evAccountData) => {
		//let dbAccountAndFrags = dbData.filter(o => o.pk === `accounts#${evAccount}`);
		let dbAccount = this.dbData.filter(o => o.pk === `accounts#${evAccount}` && o.sk === `accounts#${evAccount}`);
		let dbPzCnt = dbAccount[0] && dbAccount[0].pzCnt ? dbAccount[0].pzCnt : 0;
		let dbMvCnt = dbAccount[0] && dbAccount[0].mvCnt ? dbAccount[0].mvCnt : 0;

		dbAccounts.set(evAccount, {
			//mvCnt: dbMvCnt + evAccountData.mvCnt,
			pzCnt: dbPzCnt + evAccountData.pzCnt,
			//flCnt: evAccountData.flCnt,
			pzTS: evAccountData.pzTS
		});

		for (const [keyPrizeCat, valuePrizeCat] of Object.entries(evAccountData.prizes)) {
			let dbPrizeTierRaw = this.dbData.find(o => o.pk === `accounts#${evAccount}` && o.sk === `fragment#prizes#${keyPrizeCat}`);
			let dbPrizeTier = dbPrizeTierRaw && Object.fromEntries(
				Object.entries(dbPrizeTierRaw)
				.filter(([key]) => !['pk', 'sk','created','updated','cy_meta'].includes(key))
			);
			let mergedPrizeTier = Object.entries(valuePrizeCat).reduce((acc, [key, value]) =>
				({...acc, [key]: (acc[key] || 0) + value}), {...dbPrizeTier}
			);

			dbAccounts.item(evAccount).fragment("prizes", keyPrizeCat).set(
				mergedPrizeTier
			);

		}
	}
	
	async midnightUpdate(dbAcctCommonPrizes) {
		let dbPrize24Common = this.dbData.filter(o => o.pk === dbAcctCommonPrizes.pk && o.sk === `fragment#prizes24hrStart#common`);

		let dbPrizeCurrentR4 = dbAcctCommonPrizes && Object.fromEntries(
			Object.entries(dbAcctCommonPrizes)
			.filter(([key]) => !['pk', 'sk','created','updated','cy_meta','ATLAS'].includes(key))
		);
		let dbPrize24R4 = dbPrize24Common[0] && Object.fromEntries(
			Object.entries(dbPrize24Common[0])
			.filter(([key]) => !['pk', 'sk','created','updated','cy_meta','ATLAS'].includes(key))
		);
		let diffPrize24 = Object.entries(dbPrizeCurrentR4).reduce((acc, [key, value]) =>
			({...acc, [key]: value - (acc[key] || 0)}), {...dbPrize24R4}
		);
		let evAccount = dbAcctCommonPrizes.pk.split('#')[1];

		dbAccounts.item(evAccount).fragment("prizes24hrStart", 'common').set(
			dbPrizeCurrentR4
		);
		dbAccounts.item(evAccount).fragment("prizes24hr", 'common').set(
			diffPrize24
		);

	}
	
	async updateRecentEVAccounts() {
		let segStart = Date.now();
		const programId = new solanaWeb3.PublicKey('TESTWCwvEv2idx6eZVQrFFdvEJqGHfVA1soApk2NFKQ');
		let fleetAccounts = await solanaConnection.getProgramAccounts(programId);
		
		let tempWallet = anchor.web3.Keypair.generate();
		let anchorProvider = new anchor.AnchorProvider(solanaConnection, tempWallet, {
			preflightCommitment: "processed",
			commitment: "processed",
		});
		let anchorProg = new anchor.Program(idl, programId, anchorProvider);
		let temp = new anchor.BorshAccountsCoder(idl);

		let acctMvs = 0; //get acctMvs from DB
		let evAccounts = {};
		let fleets = {};
		
		for (const fleetAccount of fleetAccounts) {
			try {
				let evAccountData = temp.decode('Fleet', fleetAccount.account.data);
				let evLastWarp = evAccountData.lastWarpEnd.toString(10);
				let evAccount = evAccountData.owner.toBase58();
				let fleetKey = fleetAccount.pubkey.toBase58();
				if (evLastWarp * 1000 > (Date.now() - 3600000)) {
					let fleetData = {cnt: 0, lastWarp: 0, recentFleetSig: 0};
					if (evAccount in evAccounts) {
						evAccounts[evAccount].mvCnt += fleetData.cnt;
					} else {
						evAccounts[evAccount] = {mvCnt: fleetData.cnt, fleets: {}, prizes: {}};
					}
					if (fleetKey in evAccounts[evAccount].fleets) {
						evAccounts[evAccount].fleets[fleetKey].pos = fleetData.lastWarp;
						evAccounts[evAccount].fleets[fleetKey].flSig = fleetData.recentFleetSig;
					} else {
						evAccounts[evAccount].fleets[fleetKey] = {pos: fleetData.lastWarp, flSig: fleetData.recentFleetSig}
					}
				}
			} catch(e) {
				console.log(e);
			}
		}
		
		console.log("Collect done: " + (Date.now() - segStart)/1000);
		segStart = Date.now();
		
		const dbRecentAccounts = db.collection("recentAccounts");
		let recentAccountList = await dbRecentAccounts.list();
		let promisesDelete = [];
		for (const account of recentAccountList.results) {
			promisesDelete.push(
				dbRecentAccounts.item(account.key).delete()
			)
		}
		
		let retStatus = Promise.all(promisesDelete).then(() => {
			console.log("Delete done: " + (Date.now() - segStart)/1000);
			segStart = Date.now();
			let promisesWrite = [];
			for (const evAccount in evAccounts) {
				promisesWrite.push(
					dbRecentAccounts.set(evAccount)
				)
			}
			let writeStatus = Promise.all(promisesWrite).then(() => {
				console.log("Write done: " + (Date.now() - segStart)/1000);
				return {status: 'OK'};
			});
			return writeStatus;
		});

		return retStatus;
	}

	async updateEVAccounts() {
		let segStart = Date.now();
		let evAccounts = {};
		const dbRecentAccounts = db.collection("recentAccounts");
		let recentAccountList = await dbRecentAccounts.list();

		console.log("recentAccountList: " + Object.keys(recentAccountList.results).length);
		console.log("build evAccounts Time: " + (Date.now() - segStart)/1000);
		segStart = Date.now();

		let dbDataRaw = {
			Items: []
		}
		let segment_results = await Promise.all([1,2,3,4,5].map(s=>{
			return  this.parallelScan(s-1, 5)
		}))
		segment_results.forEach(s=>{
			s.results.forEach(sr=>{dbDataRaw.Items.push(sr)})
		})
		this.dbData = dbDataRaw.Items;
		
		console.log("get DB Data Time: " + (Date.now() - segStart)/1000);
		segStart = Date.now();
		
		let dbAccounts = this.dbData.filter(o => o.keys_gsi === 'accounts');

		let promisesPrizes = [];
		//for (const evAccount in evAccounts) {
		for (const recentDBAcct of recentAccountList.results) {
			let evAccount = recentDBAcct.key;
			let tempDBAcct = dbAccounts.filter(o => o.sk === `accounts#${evAccount}` && o.pk === `accounts#${evAccount}`);
			let dbPrizeTS = tempDBAcct[0] && tempDBAcct[0].pzTS ? tempDBAcct[0].pzTS : 0;
			promisesPrizes.push(this.getEVPrizes(evAccount, dbPrizeTS)
			  .then((tempAcctPrizes) => {
				//evAccounts[evAccount].prizes = tempAcctPrizes.prizes;
				//evAccounts[evAccount].pzCnt = tempAcctPrizes.count;
				//evAccounts[evAccount].pzTS = tempAcctPrizes.recentTS;
				//evAccounts[evAccount].flCnt = Object.keys(evAccounts[evAccount].fleets).length;
				evAccounts[evAccount] = {prizes: tempAcctPrizes.prizes, pzCnt: tempAcctPrizes.count, pzTS: tempAcctPrizes.recentTS, flCnt: 0};
			  })
			  .catch((error) => {
					console.error(error);
			  })
			)
		}
		
		console.log('Length: ' + promisesPrizes.length);
		let timeoutLimit = 28500 - Math.floor((Date.now() - this.totalStart));
		
		const timeout = (prom, time, exception) => {
			let timer;
			return Promise.race([
				prom,
				new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
			]).finally(() => clearTimeout(timer));
		}

		let retStatus = {status: 'Timed Out'};
		try {
			retStatus = await timeout(Promise.all(promisesPrizes).then(
				async () => {
					console.log("Prizes Time: " + (Date.now() - segStart)/1000);
					segStart = Date.now();
					
					let midnight = new Date().setUTCHours(0,0,0,0);
					if ((0 <= (Date.now() - midnight) && (Date.now() - midnight) < 600000)) {
						let promisesMidnight = [];
						let dbPrizesCommon = this.dbData.filter(o => o.sk === `fragment#prizes#common`);
						for (const dbAcctCommonPrizes of dbPrizesCommon) {
							promisesMidnight.push(this.midnightUpdate(dbAcctCommonPrizes)
							  .then(() => 0)
							  .catch((error) => {
									console.error(error);
							  })
							)
						}
						
						let midnightStatus = Promise.all(promisesMidnight).then(() => {
							console.log("Midnight Time: " + (Date.now() - segStart)/1000);
							segStart = Date.now();
						});
					}

					console.log('Writing DB');
					let promisesWrite = [];
					for (const evAccount in evAccounts) {
						promisesWrite.push(this.addEntry(evAccount, evAccounts[evAccount])
						  .then(() => 0)
						  .catch((error) => {
								console.error(error);
						  })
						)
					}
					
					let innerRetStatus = Promise.all(promisesWrite).then(() => {
						console.log("DB Time: " + (Date.now() - segStart)/1000);
						console.log("Total Time: " + (Date.now() - this.totalStart)/1000);
						return {status: 'OK'};
					});

					return innerRetStatus;
				}), timeoutLimit, Symbol());
		} catch(e) {
			console.log('Timeout reached');
			console.log(e);
		}
		return retStatus;
	}

    async parallelScan(segment, total_segments, limit=50000,  next = undefined){
        let results = []
        do{
          var params = {
			FilterExpression: "begins_with(pk,:pk)",
			ExpressionAttributeValues: {
				':pk':'accounts#',
			},
			TableName: "cooperative-wasp-turtleneck-shirtCyclicDB",
            Limit: limit,
            ScanIndexForward:false,
            Segment: segment,
            TotalSegments:total_segments,
            ExclusiveStartKey: next,
          };
          let res = await ddbClient.send(new ScanCommand(params))
          next = res.LastEvaluatedKey
          results = results.concat(res.Items)
        }while(next && results.length<limit)

        let result = {
          results,
          length: results.length
        }
        if(next){
          result.next = next
        }
        return result;
    }

    async getEVAccounts() {
		let segStart = Date.now();
		let dbDataRaw = {
			Items: []
		}
		let segment_results = await Promise.all([1,2,3,4,5].map(s=>{
			return  this.parallelScan(s-1, 5)
		}))
		segment_results.forEach(s=>{
			s.results.forEach(sr=>{dbDataRaw.Items.push(sr)})
		})
		let dbData = dbDataRaw.Items;
		console.log("get db Time: " + (Date.now() - segStart)/1000);
		segStart = Date.now();
		let dbAccounts = dbData.filter(o => o.keys_gsi === 'accounts');
		console.log("filter accounts Time: " + (Date.now() - segStart)/1000);
		segStart = Date.now();
		let acctList = [];
		console.log('dbData: ' + dbData.length);
		let dbPrizes = dbData.filter(o => o.sk.startsWith('fragment#prizes#'));
		let mappedPrizes = Object.assign({},...dbPrizes.map(item => ({[item.pk.split('#')[1] + item.sk.split('#')[2]]: item})));
		let dbPrizes24hr = dbData.filter(o => o.sk.startsWith('fragment#prizes24hr#'));
		let mappedPrizes24hr = Object.assign({},...dbPrizes24hr.map(item => ({[item.pk.split('#')[1]]: item})));
		let prizeTiers = [...new Set(dbPrizes.map(item => {return item.sk.split('#')[2]}))];
		console.log("map Time: " + (Date.now() - segStart)/1000);
		segStart = Date.now();
		
		for (let dbAcct of dbAccounts) {
			let acctName = dbAcct.pk.split('#')[1];
			let acctPrizes = {};
			for (let prizeTier of prizeTiers) {
				let acctPrizeTier = mappedPrizes[acctName + prizeTier] && Object.fromEntries(
					Object.entries(mappedPrizes[acctName + prizeTier])
					.filter(([key]) => !['pk', 'sk','created','updated','cy_meta'].includes(key))
				);
				acctPrizes[prizeTier] = acctPrizeTier;
			}
			let acctPrize24hr = mappedPrizes24hr[acctName] && Object.fromEntries(
					Object.entries(mappedPrizes24hr[acctName])
					.filter(([key]) => !['pk', 'sk','created','updated','cy_meta'].includes(key))
				);
			acctList.push({acct: acctName, pzCnt: dbAcct.pzCnt, prizes: acctPrizes, prizes24hr: acctPrize24hr});
		}

					
		console.log("build json Time: " + (Date.now() - segStart)/1000);
        return new Promise((resolve, _) => resolve(acctList));
    }
}
module.exports = Controller;