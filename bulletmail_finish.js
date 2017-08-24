//this macro is started when all data is entered and captcha is solved


//click the Register button
//check if error shows up. If no, log a row in a log.csv with the number, IP, Timestamp
//if error shows up dont do anything




const LOG_FILE = "log.csv";
const CSV_FOLDER = "C:\\Users\\Igor\\Documents\\iMacros\\Datasources";
var	LOG_FULL_PATH = CSV_FOLDER + '\\' + LOG_FILE;

const NAMES_FULL_PATH = "names.csv";
const TEST_MODE = false;

var load =  "CODE:";
load +=  "SET !TIMEOUT_STEP 1" + "\n";
load +=  "SET !ERRORIGNORE YES" + "\n"; 
load +=  "SET !TIMEOUT_PAGE 300" + "\n";
load +=  "TAG POS=1 TYPE=BUTTON FORM=NAME:NoFormName ATTR=NAME:register" + "\n"; 
load += "WAIT SECONDS=1" + "\n"; 
load += "SET !EXTRACT NULL" + "\n"; 
load += "TAG POS=1 TYPE=DIV ATTR=ROLE:alert EXTRACT=TXT" + "\n"; 
iimPlay(load);
var result = iimGetLastExtract(0);
var success = null;

if (result.startsWith("The API returned an error:")) {
	success = false;
}

if (result.startsWith("You have successfully registered!")) {
	success = true;
}

if (TEST_MODE) alert(success);

if (success) {
	var rowNumber = getTheRow();
	var load =  "CODE:";
	load += "TAG POS=1 TYPE=A ATTR=TXT:here" + "\n";
	load += "WAIT SECONDS=1" + "\n";
	load +=  "SET !extract null" + "\n";
	load +=  'TAG XPATH="//*[@id="topline"]/div[2]/span" EXTRACT=TXT' + '\n';
	iimPlay(load);
	var email = iimGetLastExtract(0);
	
	var load =  "CODE:";
	load +=  "SET !extract null" + "\n";
	load += "URL GOTO=https://www.ultratools.com/tools/yourIPResult" + "\n";
	load +=  'TAG XPATH="/html/body/div[3]/div/div[3]/div/div[2]/div/div[1]/span[2]/a" EXTRACT=TXT' + '\n';
	iimPlay(load);
	if (TEST_MODE) alert(iimGetLastExtract(0));
	//now write in log:
	
	iimSet("rowNumber",rowNumber);
	iimSet("IP",iimGetLastExtract(0));
	iimSet("email",email);
	load =  "CODE:";
	load +=  "SET !extract {{rowNumber}}" + "\n";
	load +=  "ADD !extract {{IP}}" + "\n";
	load +=  "ADD !extract {{!NOW:yymmddhhnnss}}" + "\n";
	load +=  "ADD !extract {{email}}" + "\n";
	load +=  'SAVEAS TYPE=EXTRACT FOLDER=' + CSV_FOLDER + ' FILE=' + LOG_FILE + "\n";
	iimPlay(load);
	
	//if all is ok, close firefox
	closeFirefox();
}



function getTheRow() {
	
			var i=1;
			var load =  "CODE:";
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
			if (TEST_MODE) alert(prevValue);
			var lastLog = prevValue.split("[EXTRACT]");
			var getRow = parseInt(lastLog[0])+1;
			if (TEST_MODE) alert(getRow);
			
			return getRow;
	
}

function closeFirefox() {
	var load = "CODE:";
	load += 'WAIT SECONDS=1' + '\n';
	load += 'EVENT TYPE=KEYPRESS SELECTOR=* CHAR="w" MODIFIERS="ctrl,shift"';
	iimPlay(load);
}

