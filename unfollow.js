/***********************************
 unfollow.js v1.08
************************************/

/*	
*	Open ManageFlitter
*	Sign in
*	Go to Unfollow
*	Order ascending
*	Click them all (multiple times, with delay)
*	close firefox
*/	

var PROFILE;

var TEST_MODE = true;
var SHOW_ALERTS = true;

var RETRIES = 5;			//number of total unsuccessful retries to get to the Unfollow page before we give up, log an error and proceed with following
var WAIT_LOAD = 10; 		//initial time to wait for loading profile into ManageFlitter
var MAX_WAIT_STEPS = 50;	//if profile still hasn't been loaded, how many times should it re-check
var STEP_TIME = 3;		//interval (seconds) for the additional checks

var MASS_UNFOLLOWS_COUNT = 4;	//number of batches of Unfollow click. Every batch unfollows 100 users
var MASS_UNFOLLOW_DELAY = 10000;	//miliseconds to wait after a mass unfollow click, so another batch of accounts is being loaded.

var GLOBAL_ERROR_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_ERROR_LOGS_FILE = 'global_error_log.csv';

var GLOBAL_INFO_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_INFO_LOGS_FILE = 'global_info_log.csv';

//unfollow();

function unfollow() {

	var success = false;
	var tryCount = 0

	while (!success && tryCount < RETRIES) {
		tryCount++;
		var load =  "CODE:";
		load +=  "VERSION BUILD=8970419 RECORDER=FX" + "\n"; 
		load +=  "TAB T=1" + "\n"; 
		load +=  "SET !ERRORIGNORE YES" + "\n"; 
		load +=  "SET !TIMEOUT_PAGE 10" + "\n";

		load +=  "URL GOTO=https://manageflitter.com/connect" + "\n"; 
		load +=  "TAG POS=1 TYPE=A ATTR=CLASS:bigButton" + "\n"; 
		load +=  "SET !TIMEOUT_STEP 0" + "\n";  
		load +=  "SET !EXTRACT_TEST_POPUP NO" + "\n"; 
		load +=  "SET !EXTRACT NULL" + "\n"; 
		load +=  "TAG POS=1 TYPE=INPUT:CHECKBOX ATTR=ID:remember EXTRACT=CHECKED" + "\n"; 
		load +=  'SET Check_CB EVAL("var s=\'{{!EXTRACT}}\'; var z; if(s==\'YES\'){z=0;} else{z=1;}; z;")' + '\n';
		load +=  "TAG POS={{Check_CB}} TYPE=INPUT:CHECKBOX ATTR=ID:remember CONTENT=YES" + "\n"; 
		load +=  "WAIT SECONDS=1" + "\n"; 
		load +=  "TAG POS=1 TYPE=INPUT:SUBMIT ATTR=ID:allow" + "\n"; 

		load +=  "WAIT SECONDS=" + WAIT_LOAD + "\n"; 
		iimPlay(load);
		var value;
		load =  "CODE:";
		load +=  "SET !EXTRACT NULL" + "\n"; 
		load +=  "SET !TIMEOUT_STEP 0" + "\n"; 
		load +=  "TAG POS=1 TYPE=DIV ATTR=ID:showNotFollowing EXTRACT=TXT" + "\n";
		iimPlay(load);
		value = iimGetLastExtract(1);

		var wait=0;
		while (value == '#EANF#' && wait < MAX_WAIT_STEPS) {
			load =  "CODE:";
			load +=  "WAIT SECONDS=" + STEP_TIME + "\n";
			load +=  "SET !EXTRACT NULL" + "\n"; 
			load +=  "SET !TIMEOUT_STEP 0" + "\n"; 
			load +=  "TAG POS=1 TYPE=DIV ATTR=ID:showNotFollowing EXTRACT=TXT" + "\n";	
			iimPlay(load);
			value = iimGetLastExtract(1);
			wait++;
		}
			
		if (value != '#EANF#') {
			success = true;
		} else  {
			success = false;
			
			//log a warning for unsuccessful try
			var desc = "Code 32: Unsuccessful try for Unfollow [" + tryCount + "/" + RETRIES + "]";
			writeLog(PROFILE,"WARNING",desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
			writeLog(PROFILE,"WARNING",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
		}

	}

	if (!success) {
		//log an error for unsuccessful unfollow, and close
		var desc = "Code 02: Unable to Unfollow after " + RETRIES + " retries";
		writeLog(PROFILE,"WARNING",desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
		writeLog(PROFILE,"WARNING",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);

			window.setTimeout(
			function () {
			/*
				//continue with follow
				iimPlayCode("URL GOTO=imacros://run/?m=Follow%5C" + PROFILE + "following.js");
				*/
				
				//close firefox
				closeFirefox();
			},
			MASS_UNFOLLOW_DELAY
		);
		
	} else {
		
		//all good! 
		//check number of accounts available for unfollow. 
		var valueInt;
		load =  "CODE:";
		load += "WAIT SECONDS=" + STEP_TIME + "\n";  
		load +=  "SET !EXTRACT NULL" + "\n"; 
		load +=  "SET !TIMEOUT_STEP 0" + "\n"; 
		load +=  'TAG XPATH="//div[@id=\'twitPrompt\']/b[1]" EXTRACT=TXT' + "\n";
		iimPlay(load);
		valueInt = parseInt(iimGetLastExtract(1).replace(',',''));
		if (SHOW_ALERTS) alert(valueInt);
		
		//log this number and proceed to unfollow. Show a warning if this number is < than the account intended for unfollow.
		var count = 0;
		while (isNaN(valueInt) && count < MAX_WAIT_STEPS) {
			load =  "CODE:";
			load += "WAIT SECONDS=" + STEP_TIME + "\n";  
			load +=  "SET !EXTRACT NULL" + "\n"; 
			load +=  "SET !TIMEOUT_STEP 0" + "\n"; 
			load +=  'TAG XPATH="//div[@id=\'twitPrompt\']/b[1]" EXTRACT=TXT' + "\n";
			iimPlay(load);
			valueInt = parseInt(iimGetLastExtract(1).replace(',',''));
			if (SHOW_ALERTS) alert(valueInt);

			count++;
		}
		
		if (isNaN(valueInt)) {
			var desc = "Code 34: Couldn't retrieve value for number of available accounts to unfollow. Nevertheless, trying to unfollow...";
			writeLog(PROFILE,"WARNING",desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
			writeLog(PROFILE,"WARNING",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
		} else {
			if (valueInt < MASS_UNFOLLOWS_COUNT*100) {
			var desc = "Code 33: Not enough accounts to unfollow. Available: " + valueInt + ", intended to unfollow: " + MASS_UNFOLLOWS_COUNT*100;
			writeLog(PROFILE,"WARNING",desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
			writeLog(PROFILE,"WARNING",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			}
		}
		
		//check if Unfollow button is there for the first one. wait a bit to load if it isnt present
		load =  "CODE:";
		load +=  "set !EXTRACT null" + "\n"; 
		load += 'TAG XPATH="id(\'userRows\')/div[1]/div[1]/button[1]" EXTRACT=TXT' + '\n';
		iimPlay(load);
		value2 = iimGetLastExtract(1);
		var count2 = 0;
		while (value2 != 'Unfollow' && count2 < MAX_WAIT_STEPS) {
			load =  "CODE:";
			load += "WAIT SECONDS=" + STEP_TIME + "\n"; 
			load +=  "set !EXTRACT null" + "\n"; 
			load += 'TAG XPATH="id(\'userRows\')/div[1]/div[1]/button[1]" EXTRACT=TXT' + '\n';
			iimPlay(load);
			value2 = iimGetLastExtract(1);
			count2++;
		}

		if (value2 != "Unfollow") {
			//no Unfollow button found. Obviously we can't unfollow, so log error and close
			var desc = "Code 05: Couldn't detect a single Unfollow button. Either page timed out or something else is wrong. Manual check is required.";
			writeLog(PROFILE,"ERROR",desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
			writeLog(PROFILE,"ERROR",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			closeFirefox();
		} else {
		

			
			//log unfollow initiation
			var desc = "Code 96: Initiating unfollow procedure. Found " + valueInt + " accounts for unfollowing, intended to unfollow: " + MASS_UNFOLLOWS_COUNT*100;
			writeLog(PROFILE,"INFO",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
			
			
			//do the unfollow
			//order from oldest to newest
			var load =  "CODE:";
			load +=  'EVENT TYPE=CLICK SELECTOR="#control-order" BUTTON=0' + '\n'; 
			load +=  "WAIT SECONDS=3" + "\n"; 
			load +=  'EVENT TYPE=CLICK SELECTOR="#order_followed" BUTTON=0' + '\n'; 
			 
			iimPlay(load);

			loadJQuery('https://raw.githubusercontent.com/igority/imacros/master/jq.for.im.js');			
				$ = window.$,
				JQuery = window.JQuery;

				var unfollowedCount = 0;
				for (i = 0; i < MASS_UNFOLLOWS_COUNT; i++) {
					window.setTimeout(
						function () {
							if (!TEST_MODE) window.$(".Unfollow").trigger("click");
							unfollowedCount = unfollowedCount + 100;
						},
						MASS_UNFOLLOW_DELAY*(i+1)
					);
				}
				
				
			window.setTimeout(
				function () {
					//get number of unfollowed
					//write a log
					load =  "CODE:";
					load +=  "SET !EXTRACT NULL" + "\n"; 
					load +=  "SET !TIMEOUT_STEP 0" + "\n"; 
					load +=  "TAG POS=1 TYPE=SPAN ATTR=CLASS:total EXTRACT=TXT" + "\n";
					iimPlay(load);
					var actualUnfollowCount = iimGetLastExtract(1);
					if (actualUnfollowCount == null || actualUnfollowCount == '#EANF#') {
						//log an error
						var desc = "Code 04: Unfollowing failed! Couldn't retrieve info about unfollowed accounts, most likely none are unfollowed.";
						writeLog(PROFILE,"ERROR",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
						writeLog(PROFILE,"ERROR",desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
						actualUnfollowCount = 0;
					} else {
						var desc = "Code 99: Unfollowed " + actualUnfollowCount  + " people successfully.";
						writeLog(PROFILE,"INFO",desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
					}


				},
				MASS_UNFOLLOW_DELAY*(MASS_UNFOLLOWS_COUNT+1)
			);


			window.setTimeout(
				function () {
					//close firefox
					closeFirefox()
				},
				MASS_UNFOLLOW_DELAY*(MASS_UNFOLLOWS_COUNT+2)
			);
		}
			
	}
}

function writeLog(profile,type,description,folder,file) {
	//logs will be written in this format:
	//timestamp, date, profile, type, description
	iimSet("TYPE",type);
	iimSet("PROFILE",profile);
	iimSet("DESCRIPTION",description);
	load =  "CODE:";
	load +=  "SET !extract {{!NOW:yymmddhhnnss}}" + "\n";
	load +=  "SET !extract {{!NOW:dd.mm.yyyy_hh:nn:ss}}" + "\n";
	load +=  "ADD !extract {{PROFILE}}" + "\n";
	load +=  "ADD !extract {{TYPE}}" + "\n";
	load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
	load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + folder + ' FILE=' + file + "\n";
	//load +=  'WAIT SECONDS=0.1' + '\n';
	iimPlay(load);
}

function closeFirefox() {
	if (SHOW_ALERTS) alert("closing firefox ...");
	var load = "CODE:";
	load += 'WAIT SECONDS=1' + '\n';
	load += 'EVENT TYPE=KEYPRESS SELECTOR=* CHAR="w" MODIFIERS="ctrl,shift"';
	iimPlay(load);
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