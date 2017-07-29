/***********************************
 check.js v1.02
************************************/

//global parameters with default values.
//Override these in local files if you wish them changed.


var PROFILE;

var TEST_MODE = false;
var SHOW_ALERTS = false;

var GLOBAL_ERROR_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_ERROR_LOGS_FILE = 'global_error_log.csv';

var GLOBAL_INFO_LOGS_FOLDER = 'C:\\Tasks\\GlobalLogs';
var GLOBAL_INFO_LOGS_FILE = 'global_info_log.csv';
var CSV_FOLDER = 'C:\\Tasks\\Csv';

//check();

function check() {
/*
*	Reason: 41 - wasn't logged in. After log in, account is fine
*	Reason: 42 - wasn't logged in. Couldn't log in
*	Reason: 43 - Account suspended
*	Reason: 44 - Account was logged in, everything is fine, but for some reason browser was still on
*	Reason: 45 - locked: Phone verification
*	Reason: 46 - locked: Password
* 	Reason: 47 - locked: other
*	Reason: 0 - other (default)
*/
//alert('closing other tabs');
	var load =  "CODE:";
	//load +=  "TAB T=1"; + "\n";
	load +=  "TAB CLOSEALLOTHERS"; + "\n";
	iimPlay(load);
	
	var reason = do_the_check();
	var desc;
	switch(reason) {
		case 41:
			desc = "Code 41: The previous task wasn't finished completely! Reason: The account was logged out. Successfully logged in, and confirmed account is ok";
			break;
		case 42:
			desc = "Code 42: The previous task wasn't finished completely! Reason: The account was logged out. Tried logging in, couldn't do it. Manual check required!";
			break;
		case 43:
			desc = "Code 43: The previous task wasn't finished completely! Reason: The account was suspended";
			break;
		case 44:
			desc = "Code 44: The previous task wasn't finished completely! Reason: The account was logged in, everything looks fine, but for some reason browser was still on (bug maybe?)";
			break;
		case 45:
			desc = "Code 45: The previous task wasn't finished completely! Reason: The account is locked. Pending phone verification";
			break;
		case 46:
			desc = "Code 46: The previous task wasn't finished completely! Reason: The account is locked. Password change required";
			break;
		case 47:
			desc = "Code 47: The previous task wasn't finished completely! Reason: The account is probably locked. Couldn't find the reason. Manual check required.";
			break;
		default:
			desc = "Code 49: The previous task wasn't finished completely! Reason: Couldn't find the reason. Manual check required.";
	}
	writeLog("ERROR",PROFILE,desc,GLOBAL_ERROR_LOGS_FOLDER,GLOBAL_ERROR_LOGS_FILE);
	writeLog("ERROR",PROFILE,desc,GLOBAL_INFO_LOGS_FOLDER,GLOBAL_INFO_LOGS_FILE);
	closeFirefox();
}

function do_the_check() {

	var reason=0;
	if (SHOW_ALERTS) alert('goto twitter.com');
	load =  "CODE:";
	load += 'URL GOTO="https://twitter.com"' + '\n';
	iimPlay(load);
	
	
	var accountOK = false;
	//check if account is logged in
	load =  "CODE:";
	load +=  "SET !EXTRACT NULL" + "\n";
	load +=  'TAG XPATH="id(\'page-container\')/div[1]/div[1]/div/div[2]/ul/li[1]/a/span[2]" EXTRACT=TXT' + '\n';
	iimPlay(load);
	if (SHOW_ALERTS) alert("extracting no of tweets...");
	if (SHOW_ALERTS) alert(iimGetLastExtract(1));
	if (iimGetLastExtract(1) == null || iimGetLastExtract(1) == '#EANF#') {
		//is not logged in.
		//check if locked
		//if yes return 45, 46 or 47
		//if not, try to log in
		//if success return 41
		//if not success return 42
		
		accountOK = false;
		var lockedCheck = isLocked();
		if (lockedCheck) {
			switch(reason) {
			case 1:
				return 45;
				break;
			case 2:
				return 46;
				break;
			case 3:
				return 47;
				break;
			default:
				return 47;
			}
		} else {
			//try to log in
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
				//sign in attempt was unsuccessful
				return 42;
			} else {
				//successfully signed in
				//check if suspended
				var suspendedCheck = isSuspended();
				if (suspendedCheck) {
					return 43;
				} else {
					return 41;
				}
			}

		}
		
		
	} else {
		//is logged in
		//check if suspended return 43
		//if not return 44
		accountOK = true;
		var suspendedCheck = isSuspended();
		if (suspendedCheck) {
			return 43;
		} else {
			return 44;
		}	
	}
}

function writeLog(profile,type,description,folder,file) {
	//logs will be written in this format:
	//timestamp, date, profile, type, description
	iimSet("PROCEDURE","CHECK");
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