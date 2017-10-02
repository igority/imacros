/***********************************
 follow.js v1.19a
************************************/

//global parameters with default values.
//Override these in local files if you wish them changed.

var PROFILE;				//the indentifier for this profile. This one MUST be set in the local file!

var TEST_MODE = false;
var SHOW_ALERTS = false;
var MAX_FOLLOW_COUNT = 75;
var FOLLOW_SCROLLS_COUNT = 8;

var GLOBAL_ERROR_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_ERROR_LOGS_FILE = 'global_error_log.csv';

var GLOBAL_INFO_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_INFO_LOGS_FILE = 'global_info_log.csv';
var CSV_FOLDER = 'C:\\Tasks\\Csv';

//follow();

function follow() {
	//alert("follow called.");

	LOG_FILE = PROFILE + 'log.csv';
	URLS_FILE = PROFILE + 'urls.csv';
	URLS_FULL_PATH = CSV_FOLDER + '\\' + URLS_FILE;
	LOG_FULL_PATH = CSV_FOLDER + '\\' + LOG_FILE;
	
	var i=1;
	var urls = [];
	var lastLog;
	var load;
	var value;
	var prevValue;
	var followURL;
	
	/*
	*	go to twitter.com/login
	*	check if account ok
	*	if not, check if signed in. If not, sign in
	*	else check if locked (phone, password). If yes, log error and exit
	*	if account ok, check if locked (suspended). If suspended, log error and exit.
	*	if not suspended, account ok.
	*	now grab data for tweets, follows and followers, and log info. 
	*	Proceed with following from csv
	*/
	if (SHOW_ALERTS) alert('goto twitter.com');
	load =  "CODE:";
	load += 'URL GOTO="https://twitter.com"' + '\n';
	iimPlay(load);
	
	var accountOK = false;
	//check if account ok
	load =  "CODE:";
	load +=  "SET !EXTRACT NULL" + "\n";
	load +=  'TAG XPATH="id(\'page-container\')/div[1]/div[1]/div/div[2]/ul/li[1]/a/span[2]" EXTRACT=TXT' + '\n';
	iimPlay(load);
	if (SHOW_ALERTS) alert("extracting no of tweets...");
	if (SHOW_ALERTS) alert(iimGetLastExtract(1));
	if (iimGetLastExtract(1) == null || iimGetLastExtract(1) == '#EANF#') {
		accountOK = false;
	} else {
		accountOK = true;
	}
	if (SHOW_ALERTS) alert('accountOK = ' + accountOK);
	if (!accountOK) {
		if (SHOW_ALERTS) alert('going to twitter.com/login ... ');
		//check if signed in, If not, sign in
		load =  "CODE:";
		load +=  "SET !EXTRACT NULL" + "\n";
		load += 'URL GOTO="https://twitter.com/login"' + '\n';
		load += 'WAIT SECONDS=2' + '\n';
		load +=  'TAG XPATH="id(\'page-container\')/div/div[1]/form/div[2]/button" EXTRACT=TXT' + '\n';
		iimPlay(load);

		if (SHOW_ALERTS) alert('extracting LogIn button ... ');
		if (SHOW_ALERTS) alert(iimGetLastExtract(1));
		if (iimGetLastExtract(1) == 'Log in') {
			//click the login button
			if (SHOW_ALERTS) alert('click the login button ... ');
			load =  "CODE:";
			load +=  "SET !EXTRACT NULL" + "\n";
			load +=  'TAG XPATH="id(\'page-container\')/div/div[1]/form/div[2]/button"' + '\n';
			iimPlay(load);
		}
		
		//now check if logged in. if yes accountOK = true, if not check other stuff
		if (SHOW_ALERTS) alert('check if logged in ... grab No. of tweets ... ');
		load =  "CODE:";
		load +=  "SET !EXTRACT NULL" + "\n";
		load +=  'TAG XPATH="id(\'page-container\')/div[1]/div[1]/div/div[2]/ul/li[1]/a/span[2]" EXTRACT=TXT' + '\n';
		load +=  "WAIT SECONDS=2" + "\n";
		iimPlay(load);
		if (SHOW_ALERTS) alert(iimGetLastExtract(1));
		if (iimGetLastExtract(1) == null || iimGetLastExtract(1) == '#EANF#') {
			accountOK = false;
		} else {
			accountOK = true;
		}
		if (SHOW_ALERTS) alert('accountOK = ' + accountOK);
	}
	
	var lockedCheck = isLocked();
	if (SHOW_ALERTS) alert ("lockedcheck = " + lockedCheck);
	if (!lockedCheck || !accountOK) {
		//if (1) {
		//check if suspended
		var suspendedCheck = isSuspended();
		if (suspendedCheck != 9) {
		
			//before starting with follow procedure, log info about account details
			load =  "CODE:";
			load +=  "SET !EXTRACT NULL" + "\n";
			load +=  'TAG XPATH="id(\'page-container\')/div[1]/div[1]/div/div[2]/ul/li[1]/a/span[2]" EXTRACT=TXT' + '\n';
			load +=  'TAG XPATH="id(\'page-container\')/div[1]/div[1]/div/div[2]/ul/li[2]/a/span[2]" EXTRACT=TXT' + '\n';
			load +=  'TAG XPATH="id(\'page-container\')/div[1]/div[1]/div/div[2]/ul/li[3]/a/span[2]" EXTRACT=TXT' + '\n';
			iimPlay(load);
			desc = "Code 95: Stats before follow: Tweets: " + iimGetLastExtract(1) + " Following: " + iimGetLastExtract(2) + " Followers: " + iimGetLastExtract(3) + " Initiating follow procedure ... ";
			writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			
			//=======
			//1. get an array of all urls
			load =  "CODE:";
			load +=  "set !EXTRACT NULL" + "\n"; 
			load +=  "SET !DATASOURCE " + URLS_FULL_PATH + "\n"; 
			load +=  "SET !DATASOURCE_COLUMNS 1" + "\n"; 
			load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
			load +=  "SET !extract {{!col1}}" + "\n";
			iimPlay(load);
			value=iimGetLastExtract();
			//alert(value);
			while (value != "") {
				urls[i-1] = value + '/followers';
				i++;
				load =  "CODE:";
				load +=  "set !EXTRACT NULL" + "\n"; 
				load +=  "SET !DATASOURCE " + URLS_FULL_PATH + "\n"; 
				load +=  "SET !DATASOURCE_COLUMNS 1" + "\n"; 
				load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
				load +=  "SET !extract {{!col1}}" + "\n";
				iimPlay(load);
				value=iimGetLastExtract();
			}
			
			if (SHOW_ALERTS) {

				alert("PROFILE: " + PROFILE);
				alert("\n" + "MAX_FOLLOW_COUNT: " + MAX_FOLLOW_COUNT);
				alert("\n" + "FOLLOW_SCROLLS_COUNT: " + FOLLOW_SCROLLS_COUNT);
				alert("\n" + "GLOBAL_ERROR_LOGS_FOLDER: " + GLOBAL_ERROR_LOGS_FOLDER);
				alert("\n" + "GLOBAL_ERROR_LOGS_FILE: " + GLOBAL_ERROR_LOGS_FILE);
				alert("\n" + "GLOBAL_INFO_LOGS_FOLDER: " + GLOBAL_INFO_LOGS_FOLDER);
				alert("\n" + "GLOBAL_INFO_LOGS_FILE: " + GLOBAL_INFO_LOGS_FILE);
				alert("\n" + "LOG_FILE: " + LOG_FILE);
				alert("\n" + "URLS_FILE: " + URLS_FILE);
				alert("\n" + "URLS_FULL_PATH: " + URLS_FULL_PATH);
				alert("\n" + "LOG_FULL_PATH: " + LOG_FULL_PATH);

			}
				
			//=======	
			//2. Get the last logged url	
			i=1;
			load =  "CODE:";
			load +=  "SET !EXTRACT NULL" + "\n"; 
			load +=  "SET !DATASOURCE " + LOG_FULL_PATH + "\n"; 
			load +=  "SET !DATASOURCE_COLUMNS 2" + "\n"; 
			load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
			load +=  "SET !extract {{!col1}}" + "\n";
			load +=  "ADD !extract {{!col2}}" + "\n";
			iimPlay(load);
			value=iimGetLastExtract(0);
			prevValue = value;

			while (value != "") {
				i++;	
				load =  "CODE:";
				load +=  "set !EXTRACT NULL" + "\n"; 
				load +=  "SET !DATASOURCE " + LOG_FULL_PATH + "\n"; 
				load +=  "SET !DATASOURCE_COLUMNS 2" + "\n"; 
				load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
				load +=  "SET !extract {{!col1}}" + "\n";
				load +=  "ADD !extract {{!col2}}" + "\n";
				iimPlay(load);
				prevValue = value;
				value=iimGetLastExtract(0);
			}

			lastLog = prevValue.split("[EXTRACT]");

			urls = sorturls(urls,lastLog);

			/*
			*================------------------========================
			*/

				
			//log this url
			iimSet("followURL",urls[0]);
			load =  "CODE:";
			load +=  "SET !extract {{followURL}}" + "\n";
			load +=  "ADD !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
			load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + CSV_FOLDER + ' FILE=' + LOG_FILE + "\n";
			iimPlay(load);
			
			
			var followedTotal = 0;
			var i=0;
			
			loop(i,followedTotal,urls);
		} else {
			//account suspended
			//log and exit
			var desc;
			switch(suspendedCheck) {
				case 9:
					desc = "Code 05: The account has been suspended";
					break;
				default:
					desc = "Code 10: The account is maybe locked or suspended. Type of lock not recognized, manual check required!";
			}
			writeLog("ERROR",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
			writeLog("ERROR",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			closeFirefox();
		}
			
	} else {
		if (lockedCheck) {
			var desc;
			switch(lockedCheck) {
				case 1:
					desc = "Code 03: The account has been locked! Pending phone verification!";
					break;
				case 2:
					desc = "Code 04: The account has been locked! Password change required!";
					break;
				case 3:
					desc = "Code 10: The account is probably locked (more likely) or suspended. Type of lock not recognized, manual check required!";
					break;
				case 8:
					desc = "Code 10: The account is probably suspended (more likely) or locked. Type of lock not recognized, manual check required!";
					break;
				case 9:
					desc = "Code 05: The account has been suspended!";
					break;
				default:
					desc = "Code 10: The account is maybe locked or suspended. Type of lock not recognized, manual check required!";
			}
			writeLog("ERROR",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
			writeLog("ERROR",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			closeFirefox();
		} else {
			//something is wrong, we dont know what
			var desc = "Code 10: Couldn't log in, maybe password was not remembered correctly, or some other error occurred. Manual check required!";
			writeLog("ERROR",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
			writeLog("ERROR",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			closeFirefox();
		}
	}

}

function loop(i, followedTotal, urls) {
	//if (SHOW_ALERTS) alert("start of loop: \ni = " + i + "\nfollowedTotal = " + followedTotal);
	var urlValid = false;
	iimSet("followURL",urls[i]);

	load =  "CODE:";
	load +=  "set !EXTRACT NULL" + "\n"; 
	load += "URL GOTO={{followURL}}" + "\n";
	load += "TAG POS=1 TYPE=IMG ATTR=CLASS:ProfileAvatar-image EXTRACT=ALT" + "\n";
	iimPlay(load);
	//alert(iimGetLastExtract(1));
	if (iimGetLastExtract(1) == null || iimGetLastExtract(1) == '#EANF#') {
		
		//url is invalid
		urlValid = false;
		//alert("url invalid");
		//log a warning for the invalid url
		desc = "Code 31: " + urls[i] + " is not a valid url!";
		writeLog("WARNING",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
		writeLog("WARNING",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			var lockedCheck = isLocked();
			if (!lockedCheck) {
				if (i<urls.length-1) {
					//call for the next one
					loop(i+1, followedTotal,urls);
				} else {
					//no more urls
					//log the follow procedure
					//alert("finished with warnings. followedTotal = " + followedTotal);
					var j=i+1;
					var desc = "Code 82: Follow procedure completed with warnings. Followed total of " + followedTotal + " accounts, across " + j + " urls. The quota of " + MAX_FOLLOW_COUNT + " follows was not reached.";
					writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
					closeFirefox();
				}
			} else {
				//profile locked
				var desc;
				switch(lockedCheck) {
					case 1:
						desc = "Code 03: The account has been locked! Pending phone verification!";
						break;
					case 2:
						desc = "Code 04: The account has been locked! Password change required!";
						break;
					case 3:
						desc = "Code 10: The account is probably locked (more likely) or suspended. Type of lock not recognized, manual check required!";
						break;
					case 8:
						desc = "Code 10: The account is probably suspended (more likely) or locked. Type of lock not recognized, manual check required!";
						break;
					case 9:
						desc = "Code 05: The account has been suspended!";
						break;
					default:
						desc = "Code 10: The account is maybe locked or suspended. Type of lock not recognized, manual check required!";
				}
				writeLog("ERROR",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
				writeLog("ERROR",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
				closeFirefox();
			}

	} else {
		
		//url is valid
		urlValid = true;
		followedThis = 0;
		//alert("url valid. scrolling " + FOLLOW_SCROLLS_COUNT + " times...");
			//scroll for mass follow
		load =  "CODE:";
		for (k = 0; k < FOLLOW_SCROLLS_COUNT-1; k++) {
			load +=  "EVENT TYPE=KEYPRESS SELECTOR=* KEY=35" + "\n";
			load +=  "WAIT SECONDS=2" + "\n";
			load +=  "EVENT TYPE=KEYPRESS SELECTOR=* KEY=36" + "\n";
			load +=  "WAIT SECONDS=0.5" + "\n";
		}
		load +=  "EVENT TYPE=KEYPRESS SELECTOR=* KEY=35" + "\n";
		iimPlay(load);
		loadJQuery('https://raw.githubusercontent.com/igority/imacros/master/jq.for.im.js');	
		//loadJQuery('http://devbattles.com/js/jq.for.im.js');		
		$ = window.$,
		JQuery = window.JQuery;
		jQuery = window.jQuery;

		__cnt__=0; 
		window.jQuery('.Grid-cell .not-following .follow-text').each(
			function (ind, ele) {
				ele = window.jQuery(ele);
				if (ele.css('display')!='block') {
					console.log('already following:', ind);
					return;
				}
				window.setTimeout(
				//do the clicks here
					function () {
						if (followedTotal < MAX_FOLLOW_COUNT) {
							if (!TEST_MODE) ele.click();
							followedThis++;
							followedTotal++;
						} else {
							//no need to continue with the others, we reached our goal, so we might as well close the browser
							//alert("done! no need for more checks. Log and close");
							//first check if maybe the account got locked
							var lockedCheck = isLocked();
							if (lockedCheck) {
								//log partial follow
								//log locked error
								//close
								var j=i+1;
								var desc = "Code 97: Partial follow before account locked: Followed less than " + followedThis  + " accounts from url: [" + j + "/" + urls.length + "] " + urls[i] + ". Total followed so far: LESS than " + followedTotal;
								writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
								
								var desc;
								switch(lockedCheck) {
									case 1:
										desc = "Code 03: The account has been locked! Pending phone verification!";
										break;
									case 2:
										desc = "Code 04: The account has been locked! Password change required!";
										break;
									case 3:
										desc = "Code 10: The account is probably locked (more likely) or suspended. Type of lock not recognized, manual check required!";
										break;
									case 8:
										desc = "Code 10: The account is probably suspended (more likely) or locked. Type of lock not recognized, manual check required!";
										break;
									case 9:
										desc = "Code 05: The account has been suspended!";
										break;
									default:
										desc = "Code 10: The account is maybe locked or suspended. Type of lock not recognized, manual check required!";
								}
								
								writeLog("ERROR",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
								writeLog("ERROR",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
								closeFirefox();
							} else {
							var j=i+1;
								var desc = "Code 98: Followed " + followedThis  + " accounts from url: [" + j + "/" + urls.length + "] " + urls[i] + " (partial follow, limit reached) Total followed so far: " + followedTotal;
								writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
								//log a successful follow procedure
								var j=i+1;
								var desc = "Code 81: Follow procedure completed successfully. Followed total of " + followedTotal + " accounts, across " + j + " urls";
								writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
								//close
								closeFirefox();
							}
						}
					},
					__cnt__++*5000*(Math.floor(Math.random() * (2 - 1.5)) + 1.5)
				);
			}
		);
		
		
		window.setTimeout(
		//when finished with the clicks
			function () { 
				if (followedTotal < MAX_FOLLOW_COUNT) {
					var lockedCheck = isLocked();
					if (lockedCheck) {
						//log partial follow
						//log locked error
						//close
						var j=i+1;
						var desc = "Code 97: Partial follow before account locked: Followed less than " + followedThis  + " accounts from url: [" + j + "/" + urls.length + "] " + urls[i] + ". Total followed so far: LESS than " + followedTotal;
						writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
						
						var desc;
						switch(lockedCheck) {
							case 1:
								desc = "Code 03: The account has been locked! Pending phone verification!";
								break;
							case 2:
								desc = "Code 04: The account has been locked! Password change required!";
								break;
							case 3:
								desc = "Code 10: The account is probably locked (more likely) or suspended. Type of lock not recognized, manual check required!";
								break;
							case 8:
								desc = "Code 10: The account is probably suspended (more likely) or locked. Type of lock not recognized, manual check required!";
								break;
							case 9:
								desc = "Code 05: The account has been suspended!";
								break;
							default:
								desc = "Code 10: The account is maybe locked or suspended. Type of lock not recognized, manual check required!";
						}
						writeLog("ERROR",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
						writeLog("ERROR",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
						closeFirefox();
					} else {
					//log following
					var j = i+1;
					var remains = MAX_FOLLOW_COUNT - followedTotal;
					var desc = "Code 98: Followed " + followedThis  + " accounts from url: [" + j + "/" + urls.length + "] " + urls[i] + " Total followed so far: " + followedTotal + ". Still needed to reach quota: " + remains;
					writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
					
					//if nobody got followed, it is suspicious. Better log warning so we can investigate manually
					if (followedThis == 0) {
						var desc = "Code 35: Followed 0 accounts from url: [" + j + "/" + urls.length + "] " + urls[i] + "! Check this manually, something may be wrong!";
						writeLog("WARNING",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
						writeLog("WARNING",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
					} 
					
						//check if we should proceed with next url or log and quit 
						if (followedTotal < MAX_FOLLOW_COUNT) {
							//if (SHOW_ALERTS) alert("Finished with following. Followedtotal = " + followedTotal + "\n FollowedThis = " + followedThis  + "\n i = " + i  + "\n urls.len = " + urls.length);
							if (i < urls.length-1) {
								var j=i+1;
								//if (SHOW_ALERTS) alert("Calling loop for another one. i+1 = " + j);
								//call for the next one
								loop(j, followedTotal,urls);
							} else {
								//if (SHOW_ALERTS) alert("No more urls. Logging finish with warnings and close.");
								//no more urls
								//log the follow procedure
								var j=i+1;
								var desc = "Code 82: Follow procedure completed with warnings. Followed total of " + followedTotal + " accounts, across " + j + " urls. The quota of " + MAX_FOLLOW_COUNT + " follows was not reached.";
								writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
								//close
								closeFirefox();
								
							}

						} else {
						//alert("we are done. \nFollowedtotal = " + followedTotal + "\n FollowedThis = " + followedThis + "Log success and close");
							//we are done.
							//log a successful follow procedure
							var j=i+1;
							var desc = "Code 81: Follow procedure completed successfully. Followed total of " + followedTotal + " accounts, across " + j + " urls";
							writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
							//close
							closeFirefox();
							
						}
					}
				}
			},
			__cnt__++*5000*(Math.floor(Math.random() * (2 - 1.5)) + 1.5)
		);
	}

}

function writeLog(profile,type,description,folder,file) {
	//logs will be written in this format:
	//timestamp, date, profile, type, description
	iimSet("PROCEDURE","FOLLOW");
	iimSet("TYPE",type);
	iimSet("PROFILE",profile);
	iimSet("DESCRIPTION",description);
	load =  "CODE:";
	load +=  "SET !extract {{PROCEDURE}}" + "\n";
	load +=  "ADD !extract {{!NOW:yymmddhhnnss}}" + "\n";
	load +=  "ADD !extract {{!NOW:dd.mm.yyyy_hh:nn:ss}}" + "\n";
	load +=  "ADD !extract {{PROFILE}}" + "\n";
	load +=  "ADD !extract {{TYPE}}" + "\n";
	load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
	load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + folder + ' FILE=' + file + "\n";
	//load +=  'WAIT SECONDS=0.1' + '\n';
	iimPlay(load);
}

function sorturls(urls, lastLog) {
/*	lastLog[0] contains the url of the last log; lastLog[1] contains timestamp value for the last log, we use this only to check if record exists
* 	1. search through urls array for the lastLog[0] value. Note the index when found. if not found set index 0
*	2. reverse the urls array, starting from the index+1 value to be 0 now
*	3. Example: old array 0,1,2,3,4,5 	and	lastLog[0] has index 2 	=>	new array should be 3,2,1,0,5,4
*/
	var index = 0;
	if (lastLog[1] == null) {
		//at this point we can't find a record of a log url (either no log has been recorded, or an empty log is the last one). Just grab the first URL
		index = 0;
	} else {
		//we have a URL in the log (lastLog[0]), now find that url in the array. if not found index will stay default 0

		for (i=0;i<urls.length;i++) {
			if (lastLog[0] == urls[i]) {
				index = i;
			}
		}
	}
	
	//we got the index, now do the sorting.
	var tempUrls = [];
	var newIndex;
	for (i=0;i<urls.length;i++) {
		//reverse:
		newIndex = index+1-i;
		//same order:
		//newIndex = index+1;
		if (newIndex < 0) {
			newIndex += urls.length;
			if (newIndex < 0) {
				newIndex += urls.length;
			}
		}
		if (newIndex >= urls.length) {
			newIndex -= urls.length;
			if (newIndex >= urls.length) {
				newIndex -= urls.length;
			}
		}
		tempUrls[i] = urls[newIndex];
	}
	
	return tempUrls;
}

function closeFirefox() {
	if (SHOW_ALERTS) alert("closing firefox ...");
	var load = "CODE:";
	load += 'WAIT SECONDS=1' + '\n';
	load += 'EVENT TYPE=KEYPRESS SELECTOR=* CHAR="w" MODIFIERS="ctrl,shift"';
	iimPlay(load);
}

function isSuspended() {
	/*
	 * possible values:
	 * 0 - not locked
	 * 8 - something else (suspended)
	 * 9 - suspended
	 */
		if (SHOW_ALERTS) alert("extracting suspended header...")
		var load = "CODE:";
		load += "SET !TIMEOUT_STEP 0" + "\n";
		load += "SET !EXTRACT NULL" + "\n";
		load += "TAG POS=1 TYPE=DIV ATTR=ID:account-suspended EXTRACT=TXT" + "\n";
		iimPlay(load);
		var valueSuspended = iimGetLastExtract(1).trim();
		if (SHOW_ALERTS) alert("suspended value extracted: " + valueSuspended);
		if (valueSuspended == '#EANF#' || valueSuspended == null) {
			return 0;
		} else {
			if (valueSuspended.includes('suspended')) {
				return 9;
			} else {
				return 8;
			}
		}
}

function isLocked() {
	/*
	 * possible values:
	 * 0 - not locked
	 * 1 - phone verification
	 * 2 - password change required
	 * 3 - something else (blocked)
	 */
	 if (SHOW_ALERTS) alert('starting check if locked...');
	var load = "CODE:";
	load +=  "SET !TIMEOUT_STEP 0" + "\n";
	load += "SET !EXTRACT NULL" + "\n";
	load += "TAG POS=1 TYPE=DIV ATTR=CLASS:PageHeader EXTRACT=TXT" + "\n";
	//load += "TAG POS=1 TYPE=DIV ATTR=CLASS:PageHeader&&TXT:* EXTRACT=TXT" + "\n";
	iimPlay(load);
	if (SHOW_ALERTS) alert('extracted value for PageHeader:' + iimGetLastExtract(1));
	var value = iimGetLastExtract().trim();
	if (SHOW_ALERTS) alert('trimmed value = ' + value);
	if (value == null || value == '#EANF#') {
		return 0;
	} else {
		switch(value) {
			case "Your account has been locked.":
				if (SHOW_ALERTS) alert('return 1');
				return 1;
				break;
			case "Password change required":
				if (SHOW_ALERTS) alert('return 2');
				return 2;
				break;
			default:
				if (SHOW_ALERTS) alert('return 3');
				return 3;
		}
	}
}

function loadJQuery(url) {
    var request = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1'].createInstance(Components.interfaces.nsIXMLHttpRequest),
        async = false;
    request.open('GET', url, async);
    request.send();
    if (request.status !== 200) {
        var message = 'an error occurred while loading script at url: ' + url + ', status: ' + request.status;
        iimDisplay(message);
        return false;
    }
    eval(request.response);
    return true;
}