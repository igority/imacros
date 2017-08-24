/***********************************
 tabtale_overtime.js v1.00
************************************/

//doOvertime();

function doOvertime() {

	var i = 1;
	var incompleteRows = '';
	var totalOvertime = 0; //sekundi
	var rowExists = true;
	var rowsProcessed = 0;

	while (rowExists) {
		//test da vidime dali postoi redot
		var res = getTime(i,4);
		if (res == '#EANF#') {
			rowExists = false;
		} else {
			rowExists = true;
		}
		
		if (rowExists) {
			//gi zemame vrednostite od 4te koloni

			var start = getTime(i,3);
			var finish = getTime(i,4);
			var time = getTime(i,5);
			var overtime = getTime(i,6);
			
			if (!((start == '.. ') || (finish == '.. '))) {
				
				if (time == '08:00:00') {
					//imame overtime
					totalOvertime += timeToSec(overtime);
				} else {
					//imame undertime
					totalOvertime -= substractTime(time);
				}
				rowsProcessed++;
				
				
			} else {
				var date = getTime(i,1);
				if (incompleteRows != '') {
					incompleteRows += ' ,';
				}
				incompleteRows += date;
			}
		}
		
		i++;
	}

		var result = '';
	if (rowsProcessed > 0) {
		var isUndertime = false;
		if (totalOvertime < 0) {
			isUndertime = true;
			totalOvertime = -totalOvertime;
		}
		
		if (isUndertime) {
			result += 'Imash UNDERTIME: ' + secToTime(totalOvertime) + '\n';
		} else {
			result += 'Imash OVERTIME: ' + secToTime(totalOvertime) + '\n';
		}
		result += '\nPresmetan za vkupno ' + rowsProcessed + ' denovi.\n';
	} else {
		result += 'Aj ne zaebavaj, nemash nishto za smetanje.\nGo home, you are drunk.\n';

	}
	if (incompleteRows != '') {
		result += '\nby the way, bidejki fali vlez ili izlez, ne se zemeni vo predvid denovite: ' + incompleteRows;
	}
		alert(result);
		
		alert("by igorprogramer@hotmail.com");

}

function underline(s) {
    var arr = s.split('');
    s = arr.join('\u0332');
    if (s) s = s + '\u0332';
    return s;
}

function substractTime(time) {
	//TODO
	//odzemi od 8, i snimi so -, sekundi
	return 28800-parseInt(timeToSec(time));
	
}

function timeToSec(time) {
	//TODO
	//vrakja integer sekundi od vreme vo format 08:00:00
	var values = time.split(":");
	return parseInt(values[0])*3600+parseInt(values[1])*60+parseInt(values[2]);
}

function secToTime(sec) {
	//TODO
	//vrakja integer sekundi od vreme vo format 08:00:00
var hh,mm,ss;
var hour,min;

if (sec < 59) {
	min = 0;
	hour = 0;
} else {
	min = Math.floor(sec/60);
	sec = sec % 60;
	
	if (min < 59) {
		hour = 0;
	} else {
		hour = Math.floor(min/60);
		min = min % 60;
	}
}
	

	if (hour > 9) {
		hh = hour;
	} else {
		hh = '0' + hour;
	}
	
	if (min > 9) {
		mm = min;
	} else {
		mm = '0' + min;
	}
	
	if (sec > 9) {
		ss = sec;
	} else {
		ss = '0' + sec;
	}
	
	return hh + ':' + mm + ":" + ss;
}

function getTime(row,column) {
	var load = 'CODE:';
	load += 'SET !TIMEOUT_STEP 0' + '\n';
	load += 'SET !EXTRACT NULL' + '\n';
	load += 'TAG XPATH="//html/body/*[@class=\'CSSTableGenerator\']/table/tbody/tr[' + row + ']/td[' + column + ']" EXTRACT=TXT' + '\n';
	iimPlay(load);
	result = iimGetLastExtract(0);
	return result;
}
