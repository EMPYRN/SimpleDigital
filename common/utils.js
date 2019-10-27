// Add zero in front of numbers < 10
export function zeroPad(i)
{
  if (i < 10)
  {
    i = "0" + i;
  }

  return i;
}

export function getWeekday(i)
{
  return ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][i];
}

export function getMonth(i)
{
  return ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"][i];
}

export function getMiles(i)
{
     return (i * 0.000621371192).toFixed(2);
}

export function getMeters(i)
{
     return i * 1609.344;
}
