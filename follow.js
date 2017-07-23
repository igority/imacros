//default values to the parameters. These can be overriden in the local .js file
//PROFILE must be set in the local js file

var MAX_FOLLOW_COUNT = 100;
var FOLLOW_SCROLLS_COUNT = 1;

var PROFILE;				//the indentifier for this profile

var GLOBAL_ERROR_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_ERROR_LOGS_FILE = 'global_error_log.csv';

var GLOBAL_INFO_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_INFO_LOGS_FILE = 'global_info_log.csv';

var LOG_FILE = PROFILE + 'log.csv';
var URLS_FILE = PROFILE + 'urls.csv';

var CSV_FOLDER = 'C:\\Tasks\\Csv';

var URLS_FULL_PATH = CSV_FOLDER + '\\' + URLS_FILE;
var LOG_FULL_PATH = CSV_FOLDER + '\\' + LOG_FILE;

function follow() {
	
var i=1;
var urls = [];
var lastLog;
var load;
var value;
var prevValue;
var followURL;
/*
urls[0] = "https://twitter.com/ddfporno/followers";
urls[1] = "https://twitter.com/realitykingsxxx/followers";
urls[2] = "https://twitter.com/clementine_cro/followers";
urls[3] = "https://twitter.com/mostlyboobz/followers";
urls[4] = "https://twitter.com/lesbian_pornbj/followers";
urls[5] = "https://twitter.com/lingeshwar18/followers";
*/



//=======
//1. get an array of all urls
load =  "CODE:";
load +=  "set !extract null" + "\n"; 
load +=  "SET !DATASOURCE " + URLS_FULL_PATH + "\n"; 
load +=  "SET !DATASOURCE_COLUMNS 1" + "\n"; 
load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
load +=  "SET !extract {{!col1}}" + "\n";
iimPlay(load);
value=iimGetLastExtract();

while (value != "") {
	urls[i-1] = value + '/followers';
	i++;
	load =  "CODE:";
	load +=  "set !extract null" + "\n"; 
	load +=  "SET !DATASOURCE " + URLS_FULL_PATH + "\n"; 
	load +=  "SET !DATASOURCE_COLUMNS 1" + "\n"; 
	load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
	load +=  "SET !extract {{!col1}}" + "\n";
	iimPlay(load);
	value=iimGetLastExtract();
}
	
	//=======	
//2. Get the last logged url	
i=1;
load =  "CODE:";
load +=  "set !extract null" + "\n"; 
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
	load +=  "set !extract null" + "\n"; 
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

//lastLog[1] contains the url of the last login. Sort the urls array based on this value
/*
var alertmsg = "urls before sort:\n";
for (i=0;i<urls.length;i++) {
	alertmsg += urls[i] + "\n";
}
alert(alertmsg);
*/
urls = sorturls(urls,lastLog);
/*
var alertmsg = "urls after sort:\n";
for (i=0;i<urls.length;i++) {
	alertmsg += urls[i] + "\n";
}
alert(alertmsg);
*/
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
	
	loop(i,followedTotal);
	
}

function writeLog(profile,type,description,folder,file) {
	iimSet("TYPE",type);
	iimSet("PROFILE",profile);
	iimSet("DESCRIPTION",description);
	load =  "CODE:";
	load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
	load +=  "ADD !extract {{PROFILE}}" + "\n";
	load +=  "ADD !extract {{TYPE}}" + "\n";
	load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
	load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + folder + ' FILE=' + file + "\n";
	load +=  'WAIT SECONDS=3' + '\n';
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

function loop(i, followedTotal) {
	
	alert("start of loop: \ni = " + i + "\nfollowedTotal = " + followedTotal);
	var urlValid = false;
	iimSet("followURL",urls[i]);

	load =  "CODE:";
	load +=  "set !EXTRACT null" + "\n"; 
	load += "URL GOTO={{followURL}}" + "\n";
	load += "TAG POS=1 TYPE=IMG ATTR=CLASS:ProfileAvatar-image EXTRACT=ALT" + "\n";
	iimPlay(load);
	alert(iimGetLastExtract(1));
	if (iimGetLastExtract(1) == null || iimGetLastExtract(1) == '#EANF#') {
		
		//url is invalid
		urlValid = false;
		alert("url invalid");
		//log a warning for the invalid url
		desc = "Code 31: " + urls[i] + " is not a valid url!";
		writeLog("WARNING",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
		/*
		iimSet("TYPE","WARNING");
		iimSet("PROFILE",PROFILE);
		iimSet("DESCRIPTION","Code 31: " + urls[i] + " is not a valid url!");
		load =  "CODE:";
		load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
		load +=  "ADD !extract {{PROFILE}}" + "\n";
		load +=  "ADD !extract {{TYPE}}" + "\n";
		load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
		load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_ERROR_LOGS_FOLDER + ' FILE=' + GLOBAL_ERROR_LOGS_FILE + "\n";
		load +=  'WAIT SECONDS=3' + '\n';
		iimPlay(load);
		*/
			if (followedTotal < MAX_FOLLOW_COUNT) {
				if (i<urls.length) {
					//call for the next one
					loop(i+1, followedTotal);
				} else {
					//no more urls
					//log the follow procedure
					alert("finished with warnings. followedTotal = " + followedTotal);
					var desc = "Code 82: Follow procedure completed with warnings. Followed total of " + followedTotal + " accounts, across " + i + " urls. The quota of " + MAX_FOLLOW_COUNT + " follows was not reached.";
					writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
					/*
					iimSet("TYPE","INFO");
					iimSet("PROFILE",PROFILE);
					iimSet("DESCRIPTION","Code 82: Follow procedure completed with warnings. Followed total of " + followedTotal + " accounts, across " + i + " urls. The quota of " + MAX_FOLLOW_COUNT + " follows was not reached.");
					load =  "CODE:";
					load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
					load +=  "ADD !extract {{PROFILE}}" + "\n";
					load +=  "ADD !extract {{TYPE}}" + "\n";
					load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
					load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_INFO_LOGS_FOLDER + ' FILE=' + GLOBAL_INFO_LOGS_FILE + "\n";
					load +=  'WAIT SECONDS=3' + '\n';
					iimPlay(load);
					*/
					//close
					var myCode = 'EVENT TYPE=KEYPRESS SELECTOR=* CHAR="w" MODIFIERS="ctrl,shift"';
					iimPlayCode(myCode);
				}
			} else {
				//we are done.
				//log a successful follow procedure
				alert("finished ok. followedTotal = " + followedTotal);
				var desc = "Code 81: Follow procedure completed successfully. Followed total of " + followedTotal + " accounts, across " + i + " urls";
				writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
				/*
				iimSet("TYPE","INFO");
				iimSet("PROFILE",PROFILE);
				iimSet("DESCRIPTION","Code 81: Follow procedure completed successfully. Followed total of " + followedTotal + " accounts, across " + i + " urls");
				load =  "CODE:";
				load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
				load +=  "ADD !extract {{PROFILE}}" + "\n";
				load +=  "ADD !extract {{TYPE}}" + "\n";
				load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
				load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_INFO_LOGS_FOLDER + ' FILE=' + GLOBAL_INFO_LOGS_FILE + "\n";
				load +=  'WAIT SECONDS=3' + '\n';
				iimPlay(load);
				*/
				//close
				var myCode = 'EVENT TYPE=KEYPRESS SELECTOR=* CHAR="w" MODIFIERS="ctrl,shift"';
				iimPlayCode(myCode);
			}

	} else {
		
		//url is valid
		urlValid = true;
		followedThis = 0;
		alert("url valid. scrolling " + FOLLOW_SCROLLS_COUNT + " times...");
			//scroll for mass follow
		load =  "CODE:";
		for (k = 0; k < FOLLOW_SCROLLS_COUNT; k++) {
			load +=  "EVENT TYPE=KEYPRESS SELECTOR=* KEY=36" + "\n";
			load +=  "WAIT SECONDS=1" + "\n";
			load +=  "EVENT TYPE=KEYPRESS SELECTOR=* KEY=35" + "\n";
			load +=  "WAIT SECONDS=3" + "\n";
		}
		iimPlay(load);
		
		loadScriptFromURL('http://devbattles.com/js/jq.for.im.js');		
		$ = window.$,
		JQuery = window.JQuery;
		jQuery = window.jQuery;

		__cnt__=0; 
		window.jQuery('.Grid-cell .not-following .follow-text').each(
			function (i, ele) {
				ele = window.jQuery(ele);
				if (ele.css('display')!='block') {
					console.log('already following:', i);
					return;
				}
				window.setTimeout(
					function () {
						if (followedTotal < MAX_FOLLOW_COUNT) {
							//ele.click();
							followedThis++;
							followedTotal++;
						} else {
							//no need to continue with the others, we reached our goal, so we might as well close the browser
							alert("done! no need for more checks. Log and close");
							
							var desc = "Code 98: Followed " + followedThis  + " accounts from url: [" + i + "/" + urls.length + "] " + urls[i] + ".(partial follow, limit reached) Total followed so far: " + followedTotal;
							writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
							//log a successful follow procedure
							var desc = "Code 81: Follow procedure completed successfully. Followed total of " + followedTotal + " accounts, across " + i + " urls";
							writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
						}
					},
					__cnt__++*1000*(Math.floor(Math.random() * (2 - 1.5)) + 1.5)
				);
			}
		);
		
		
		window.setTimeout(
			function () {
				
				
				//log following
				var desc = "Code 98: Followed " + followedThis  + " accounts from url: [" + i + "/" + urls.length + "] " + urls[i] + ". Total followed so far: " + followedTotal;
				writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
				/*
					iimSet("TYPE","INFO");
					iimSet("PROFILE",PROFILE);
					iimSet("DESCRIPTION","Code 98: Followed " + followedThis  + " accounts from url: [" + i + "/" + urls.length + "] " + urls[i] + ". Total followed so far: " + followedTotal);
					load =  "CODE:";
					load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
					load +=  "ADD !extract {{PROFILE}}" + "\n";
					load +=  "ADD !extract {{TYPE}}" + "\n";
					load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
					load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_INFO_LOGS_FOLDER + ' FILE=' + GLOBAL_INFO_LOGS_FILE + "\n";
					load +=  'WAIT SECONDS=3' + '\n';
					iimPlay(load);
				*/
					//check if we should proceed with next url or log and quit 
					if (followedTotal < MAX_FOLLOW_COUNT) {
						
						alert("Finished with following. Followedtotal = " + followedTotal + "\n FollowedThis = " + followedThis);
						if (i<urls.length) {
							var j=i+1;
							alert("Calling loop for another one. i+1 = " + j);
							//call for the next one
							loop(j, followedTotal);
						} else {
							alert("No more urls. Logging finish with warnings and close.");
							//no more urls
							//log the follow procedure
							desc = "Code 82: Follow procedure completed with warnings. Followed total of " + followedTotal + " accounts, across " + i + " urls. The quota of " + MAX_FOLLOW_COUNT + " follows was not reached.";
							writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
							/*
							iimSet("TYPE","INFO");
							iimSet("PROFILE",PROFILE);
							iimSet("DESCRIPTION","Code 82: Follow procedure completed with warnings. Followed total of " + followedTotal + " accounts, across " + i + " urls. The quota of " + MAX_FOLLOW_COUNT + " follows was not reached.");
							load =  "CODE:";
							load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
							load +=  "ADD !extract {{PROFILE}}" + "\n";
							load +=  "ADD !extract {{TYPE}}" + "\n";
							load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
							load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_INFO_LOGS_FOLDER + ' FILE=' + GLOBAL_INFO_LOGS_FILE + "\n";
							load +=  'WAIT SECONDS=3' + '\n';
							iimPlay(load);
							*/
							//close
							var myCode = 'EVENT TYPE=KEYPRESS SELECTOR=* CHAR="w" MODIFIERS="ctrl,shift"';
							iimPlayCode(myCode);
							
						}
					/*	*/
					} else {
					alert("we are done. \nFollowedtotal = " + followedTotal + "\n FollowedThis = " + followedThis + "Log success and close");
						//we are done.
						//log a successful follow procedure
						var desc = "Code 81: Follow procedure completed successfully. Followed total of " + followedTotal + " accounts, across " + i + " urls";
						writeLog("INFO",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
						/*
						iimSet("TYPE","INFO");
						iimSet("PROFILE",PROFILE);
						iimSet("DESCRIPTION","Code 81: Follow procedure completed successfully. Followed total of " + followedTotal + " accounts, across " + i + " urls");
						load =  "CODE:";
						load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
						load +=  "ADD !extract {{PROFILE}}" + "\n";
						load +=  "ADD !extract {{TYPE}}" + "\n";
						load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
						load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_INFO_LOGS_FOLDER + ' FILE=' + GLOBAL_INFO_LOGS_FILE + "\n";
						load +=  'WAIT SECONDS=3' + '\n';
						iimPlay(load);
						*/
						//close
						var myCode = 'EVENT TYPE=KEYPRESS SELECTOR=* CHAR="w" MODIFIERS="ctrl,shift"';
						iimPlayCode(myCode);
						
					}
					
			},
			__cnt__++*1000*(Math.floor(Math.random() * (2 - 1.5)) + 1.5)
		);
	}

}
