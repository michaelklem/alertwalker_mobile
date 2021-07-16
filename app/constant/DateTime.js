import Colors from './Colors';

const monthsOfYearLong = [ 'January',  'February',  'March',  'April',  'May',  'June',  'July',  'August',  'September',  'October',  'November',  'December' ];
const monthsOfYearShort = [ 'Jan',  'Feb',  'Mar',  'Apr',  'May',  'June',  'July',  'Aug',  'Sep',  'Oct',  'Nov',  'Dec' ];

function formatAMPM(date)
{
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function getColorFromDate(datetime, isGradient = true)
{
  var differenceInTime = datetime.getTime() - new Date().getTime();
  differenceInTime = parseInt(differenceInTime / (1000 * 3600 * 24));

  var bgColorStyle = isGradient ? [] : null;
  // Same day
  if(differenceInTime <= 1)
  {
    if(isGradient)
    {
      bgColorStyle = [Colors.dayOfRed1, Colors.dayOfRed2];
    }
    else
    {
      bgColorStyle = Colors.dayOfRed1;
    }
  }
  // Same week
  else if(differenceInTime <= 7)
  {
    if(isGradient)
    {
      bgColorStyle = [Colors.weekOfYellow1, Colors.weekOfYellow2];
    }
    else
    {
      bgColorStyle = Colors.weekOfYellow1;
    }
  }
  // Same month
  else if(differenceInTime <= 30)
  {
    if(isGradient)
    {
      bgColorStyle = [Colors.monthOfGreen1, Colors.monthOfGreen2];
    }
    else
    {
      bgColorStyle = Colors.monthOfGreen1;
    }
  }
  else
  {
    if(isGradient)
    {
      bgColorStyle = [Colors.plainGray1, Colors.plainGray2];
    }
    else
    {
      bgColorStyle = Colors.plainGray1;
    }
  }
  return bgColorStyle;
}


function formatDateOnly(date)
{
  date = new Date(date);
  var day = date.getDate();
  // This prints it 16.07.2020
  //var month = ("0" + (date.getMonth() + 1)).slice(-2);
  // This prints it July 16th, 2020
  var month = monthsOfYearShort[(date.getMonth())];
  var year = date.getFullYear();
  var strTime = month + ' ' + day + ' ' + year;
  return strTime;
}

function formatFullDate2(date)
{
  date = new Date(date);
  const dateStr = formatDateOnly(date);
  const timeStr = formatAMPM(date);
  return dateStr + ' ' + timeStr;
  //return 'Test';
}

/**
  Get the minutes apart from two date times
  @param  {Date}  fromDate
  @param  {Date}  toDate
  @returns  {Int} Total minutes apart
*/
function getMinutesApart(fromDate, toDate)
{
  var diff =(toDate.getTime() - fromDate.getTime()) / 1000;
  diff /= 60;
  return Math.round(diff);
}



module.exports =
{
  formatFullDate2: formatFullDate2,
	MONTH_NAMES_LONG:	 monthsOfYearLong,
	MONTH_NAMES_SHORT: monthsOfYearShort,
	formatAMPM: formatAMPM,
  getColorFromDate: getColorFromDate,
  formatDateOnly: formatDateOnly,
  getMinutesApart: getMinutesApart,
  DAY_OF_WEEK_SHORT: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}
