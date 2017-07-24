/***********************************
 unfollow.js v1.00
************************************/

/*	
*	Open ManageFlitter
*	Sign in
*	Go to Unfollow
*	Order ascending
*	Click them all (multiple times, with delay)
*/	

var PROFILE;

var TEST_MODE = true;
var SHOW_ALERTS = true;

var RETRIES = 5;			//number of total unsuccessful retries to get to the Unfollow page before we give up, log an error and proceed with following
var WAIT_LOAD = 10; 		//initial time to wait for loading profile into ManageFlitter
var MAX_WAIT_STEPS = 50;	//if profile still hasn't been loaded, how many times should it re-check
var STEP_TIME = 3;		//interval (seconds) for the additional checks

var MASS_UNFOLLOWS_COUNT = 4;	//number of batches of Unfollow click. Every batch unfollows 100 users
var MASS_UNFOLLOW_DELAY = 4000;	//miliseconds to wait after a mass unfollow click, so another batch of accounts is being loaded.

var GLOBAL_ERROR_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_ERROR_LOGS_FILE = 'global_error_log.csv';

var GLOBAL_INFO_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_INFO_LOGS_FILE = 'global_info_log.csv';

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
			
		if (wait < MAX_WAIT_STEPS ) {
			success = true;
		} else  {
			success = false;
			
			//log a warning for unsuccessful try
			iimSet("TYPE","WARNING");
			iimSet("PROFILE",PROFILE);
			iimSet("DESCRIPTION","Code 32: Unsuccessful try for Unfollow [" + tryCount + "/" + RETRIES + "]");
			load =  "CODE:";
			load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
			load +=  "ADD !extract {{TYPE}}" + "\n";
			load +=  "ADD !extract {{PROFILE}}" + "\n";
			load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
			load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_ERROR_LOGS_FOLDER + ' FILE=' + GLOBAL_ERROR_LOGS_FILE + "\n";
			load +=  'WAIT SECONDS=3' + '\n';
			iimPlay(load);
		}

	}

	if (tryCount >= RETRIES) {
		//log an error for unsuccessful unfollow, and proceed to follow
		iimSet("TYPE","ERROR");
		iimSet("PROFILE",PROFILE);
		iimSet("DESCRIPTION","Code 02: Unable to Unfollow after " + RETRIES + " retries");
		load =  "CODE:";
		load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
		load +=  "ADD !extract {{TYPE}}" + "\n";
		load +=  "ADD !extract {{PROFILE}}" + "\n";
		load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
		load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_ERROR_LOGS_FOLDER + ' FILE=' + GLOBAL_ERROR_LOGS_FILE + "\n";
		iimPlay(load);
			window.setTimeout(
			function () {
				//continue with follow
				iimPlayCode("URL GOTO=imacros://run/?m=Follow%5C" + PROFILE + "following.js");
			},
			MASS_UNFOLLOW_DELAY
		);
		
	} else {
		
		//all good! do the unfollow
		
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
				//write successful unfollow log 
				iimSet("TYPE","INFO");
				iimSet("PROFILE",PROFILE);
				iimSet("DESCRIPTION","Code 99: Unfollowed " + unfollowedCount  + " people successfully.");
				load =  "CODE:";
				load +=  "SET !extract {{!NOW:ddmmyy_hhnnss}}" + "\n";
				load +=  "ADD !extract {{TYPE}}" + "\n";
				load +=  "ADD !extract {{PROFILE}}" + "\n";
				load +=  "ADD !extract {{DESCRIPTION}}" + "\n";
				load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + GLOBAL_INFO_LOGS_FOLDER + ' FILE=' + GLOBAL_INFO_LOGS_FILE + "\n";
				iimPlay(load);
			},
			MASS_UNFOLLOW_DELAY*(MASS_UNFOLLOWS_COUNT+1)
		);


		window.setTimeout(
			function () {
				//continue with follow
				iimPlayCode("URL GOTO=imacros://run/?m=Follow%5C" + PROFILE + "following.js");
			},
			MASS_UNFOLLOW_DELAY*(MASS_UNFOLLOWS_COUNT+2)
		);
		
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
