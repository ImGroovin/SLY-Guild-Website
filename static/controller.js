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
		console.log(`Starting addEntry: ${evAccount} - ${evAccountData}`);
		let dbAccount = this.dbData.filter(o => o.pk === `accounts#${evAccount}` && o.sk === `accounts#${evAccount}`);
		let dbPzCnt = dbAccount[0] && dbAccount[0].pzCnt ? dbAccount[0].pzCnt : 0;
		let dbMvCnt = dbAccount[0] && dbAccount[0].mvCnt ? dbAccount[0].mvCnt : 0;
		await dbAccounts.set(evAccount, {
			mvCnt: dbMvCnt + evAccountData.mvCnt,
			pzCnt: dbPzCnt + evAccountData.pzCnt,
			flCnt: evAccountData.flCnt,
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
			await dbAccounts.item(evAccount).fragment("prizes", keyPrizeCat).set(
				mergedPrizeTier
			);
		}
	}

	async updateEVAccounts() {
	//const updateEVAccounts = async() => {
		const programId = new solanaWeb3.PublicKey('TESTWCwvEv2idx6eZVQrFFdvEJqGHfVA1soApk2NFKQ');
		// const fleetKey = new solanaWeb3.PublicKey('CcPb2iSqLHCDBEd8J5qBFsUkARcJ9AgB8UcAKHwhB9rk');
		let fleetAccounts = await solanaConnection.getProgramAccounts(programId);
		// let fleetAccount = fleetAccounts[0];
		
		let tempWallet = anchor.web3.Keypair.generate();
		let anchorProvider = new anchor.AnchorProvider(solanaConnection, tempWallet, {
			preflightCommitment: "processed",
			commitment: "processed",
		});
		let anchorProg = new anchor.Program(idl, programId, anchorProvider);
		let temp = new anchor.BorshAccountsCoder(idl);
	//		let temp1 = temp.decode('Fleet', fleetAccount.account.data);
	//		console.log(temp1);
		
		//let tempAcctPrizes = await getEVPrizes('G3VwAJ6Ya4ADbDb2ch2gkaNPxeDsRBocyyHNC7SpCXPh');
		//let evAccounts = fleetAccounts.reduce(function (results, fleetAccount) {
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
					//let dbFleet = await dbAccounts.item(evAccount).fragment("fleets", fleetKey).get();
					//let dbFleet;
					//let dbFleetTS = dbFleet && dbFleet.flSig ? dbFleet.flSig : null;
					//let fleetData = await getTxCnt(new solanaWeb3.PublicKey(fleetKey), null, dbFleetTS);
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
		console.log('Getting prizes');
		let promises = [];
		let iter = 0;
		console.log(Object.keys(evAccounts).length);
		//for (const evAccount in evAccounts) {
		let evAccount = Object.keys(evAccounts)[0];
		console.log(evAccount);
			promises.push(
				dbAccounts.item(evAccount).get()
				.then((dbAccount) => {
					console.log('Fetching');
					let dbPrizeTS = dbAccount && dbAccount.props && dbAccount.props.pzTS ? dbAccount.props.pzTS : 0;
					let tempRet = this.getEVPrizes(evAccount, dbPrizeTS);
					console.log(`tempRet: ${tempRet}`);
					return tempRet
				})
				.then((tempAcctPrizes) => {
					console.log(`Prizes: ${tempAcctPrizes}`);
					evAccounts[evAccount].prizes = tempAcctPrizes.prizes;
					evAccounts[evAccount].pzCnt = tempAcctPrizes.count;
					evAccounts[evAccount].pzTS = tempAcctPrizes.recentTS;
					evAccounts[evAccount].flCnt = Object.keys(evAccounts[evAccount].fleets).length;
					return "something"
				})
			)
			iter++;
		//}
		console.log('Loop done');
		console.log(promises);
		console.log(promises.length);
		let retStatus = Promise.all(promises).then(async () => {
			//fs.writeFile('evAccounts.json', JSON.stringify(evAccounts), (error) => {
			//	if (error) {
			//		throw error;
			//	}
			//});
			console.log('Getting DB');
			let params = {
				FilterExpression: "begins_with(pk,:pk)",
				ExpressionAttributeValues: {
					':pk':'accounts#',
				},
				TableName: "cooperative-wasp-turtleneck-shirtCyclicDB",
			};
			let dbDataRaw = {Items: {}}
			try {
				let dbDataRaw = await ddbClient.send(new ScanCommand(params))
			} catch(e) {
				console.log(e);
			}
			this.dbData = dbDataRaw.Items;
			console.log('Writing DB');
			let promisesWrite = [];
			for (const evAccount in evAccounts) {
				promisesWrite.push(this.addEntry(evAccount, evAccounts[evAccount])
					.then(() => 0)
					.catch((error) => {
						console.error(error);
					});
				)
			}
			
			let innerRetStatus = Promise.all(promisesWrite).then(() => {
				console.log("Write done: " + Date.now());
				console.log("Total Time: " + (Date.now() - this.totalStart)/1000);
				return {status: 'OK'};
			});
			return innerRetStatus;
		})
		.catch((error) => {
			console.error(error);
		});
		return retStatus;
	}

    async getEVAccounts() {

		let params = {
			FilterExpression: "begins_with(pk,:pk)",
			ExpressionAttributeValues: {
				':pk':'accounts#',
			},
			TableName: "cooperative-wasp-turtleneck-shirtCyclicDB",
		};
		let dbDataRaw = await ddbClient.send(new ScanCommand(params));
		let dbData = dbDataRaw.Items;
		let dbAccounts = dbData.filter(o => o.keys_gsi === 'accounts');
		let acctList = [];
		for (let dbAcct of dbAccounts) {
			let acctName = dbAcct.pk.split('#')[1];
			let acctPrizeTiers = dbData.filter(o => o.pk === `accounts#${acctName}` && o.sk.startsWith('fragment#prizes'));
			let acctPrizes = {};
			for (let acctPrizeTierRaw of acctPrizeTiers) {
				let acctPrizeTierName = acctPrizeTierRaw.sk.split('#')[2];
				let acctPrizeTier = Object.fromEntries(
					Object.entries(acctPrizeTierRaw)
					.filter(([key]) => !['pk', 'sk','created','updated','cy_meta'].includes(key))
				);
				acctPrizes[acctPrizeTierName] = acctPrizeTier;
			}
			acctList.push({acct: acctName, pzCnt: dbAcct.pzCnt, prizes: acctPrizes});
		}
        return new Promise((resolve, _) => resolve(acctList));
    }
}
module.exports = Controller;