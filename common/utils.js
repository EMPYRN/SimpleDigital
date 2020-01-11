export const COLOR_LIST =
[
    { color: "#ffffff" }, // White
    { color: "#a0a0a0" }, // Light Gray
    { color: "#505050" }, // Dark Gray
    { color: "#303030" }, // Extra Dark Gray
    { color: "#E4FA3C" }, // Yellow
    { color: "#FFD733" }, // Peach
    { color: "#FC6B3A" }, // Orange
    { color: "#F83C40" }, // Red
    { color: "#F80070" }, // Magenta
    { color: "#F83478" }, // Pink
    { color: "#A51E7C" }, // Plum
    { color: "#D828B8" }, // Violet
    { color: "#BD4EFC" }, // Purple
    { color: "#884CFF" }, // Indigo
    { color: "#7898F8" }, // Cerulean
    { color: "#7090B5" }, // Slate
    { color: "#BCD8F8" }, // Lavender
    { color: "#2490DD" }, // Blue
    { color: "#13D3F5" }, // Cyan
    { color: "#38F8DF" }, // Aqua
    { color: "#00A629" }, // Green
    { color: "#67E55D" }, // Mint
    { color: "#B8FC68" }, // Lime
    { color: "#1B2C40" }, // Slate Press
];

export const COLORED_OPTIONS =
[
    [ "Clock Color",            "clockColor" ],
    [ "Date Color",             "dateColor" ],
    [ "Battery Icon Color",     "batteryIconColor" ],
    [ "Heart Rate Icon Color",  "heartRateIconColor" ],
    [ "Empty Stat Icon Color",  "emptyStatIconColor" ],
    [ "Full Stat Icon Color",   "fullStatIconColor" ],
    [ "Text Color",             "textColor" ],
    [ "Time Line Fill Color",   "timelineFullColor" ]
]

export const WEEKDAY_LONG = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
]

export const WEEKDAY_SHORT = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
]

export const MONTH_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

export const MONTH_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
]

/**
 * Pad numbers less than 10 with a leading 0
 * @param {} i number to pad
 */
export function zeroPad(i)
{
    if (i < 10)
    {
        return "0" + i;
    }

    return i.toString();
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
