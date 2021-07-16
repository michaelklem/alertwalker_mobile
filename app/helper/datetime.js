
export function formatAMPM(date)
{
  date = new Date(date);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

export function formatDateOnly(date)
{
  date = new Date(date);
  var day = date.getDate();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var year = date.getFullYear();
  var strTime = month + ' ' + day + ' ' + year;
  return strTime;
}


/**
  Get the minutes apart from two date times
  @param  {Date}  fromDate
  @param  {Date}  toDate
  @returns  {Int} Total minutes apart
*/
export function getMinutesApart(fromDate, toDate)
{
  var diff =(toDate.getTime() - fromDate.getTime()) / 1000;
  diff /= 60;
  return Math.round(diff);
}
