export function extractValueFromPointer(iFieldName, iRow)
{
  //console.log(iFieldName);

  var visibleText = "";
  var fieldName = iFieldName;
  var fieldNameInPtr = "";
  var row = iRow;

  // Get total pointers in key
  let occurrences = (fieldName.match(/\./g) || []).length;
  if(occurrences === 0)
  {
    return iRow[iFieldName];
  }

  // Iterate all pointers
  var splitIndex = -1;
  for(var i = 0; i < occurrences; i++)
  {
    splitIndex = fieldName.indexOf('.');
    try
    {
      // Extract pointer
      fieldNameInPtr  = fieldName.substring(splitIndex + 1);
      fieldName = fieldName.substring(0, splitIndex);

      // Slowly parse down the data
      if(fieldNameInPtr.indexOf('.') !== -1)
      {
        row = row[fieldName];
      }
      else
      {
        return row[fieldName][fieldNameInPtr];
      }
      fieldName = fieldNameInPtr;
    }
    catch(err)
    {
      console.log("Pointer: " + fieldNameInPtr + " not found in property " + fieldName)
      return "";
    }
  }
}
