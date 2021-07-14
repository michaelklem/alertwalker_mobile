export function getVariableValue(qs, variable)
{
  let vars = qs.split('&');
  for (var i = 0; i < vars.length; i++)
  {
    let pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable)
    {
      return decodeURIComponent(pair[1]);
    }
  }
}
