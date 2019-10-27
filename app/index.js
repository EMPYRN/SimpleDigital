import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { me as device } from "device";
import * as util from "../common/utils";
import * as messaging from "messaging";
import * as fs from "fs";
import * as deviceSettings from "./deviceSettings";

import { me as appbit } from "appbit";
import { battery } from "power";
import { display } from "display";
import { HeartRateSensor } from "heart-rate";
import { vibration } from "haptics";
import userActivity from "user-activity";
import { geolocation } from "geolocation";

// Text Items
const main = document.getElementById("time");
const batt = document.getElementById("battText");
const currDate = document.getElementById("date");
const heartRate = document.getElementById("hrText");
const steps = document.getElementById("stepsText");
const activeMinutes = document.getElementById("amText");
const calories = document.getElementById("calsText");
const distance = document.getElementById("distText");
const elevationGain = document.getElementById("floorsText");

// Icons
const battImg = document.getElementById("battIcon");
const stepsImg = document.getElementById("stepsIcon");
const amImg = document.getElementById("amIcon");
const calsImg = document.getElementById("calsIcon");
const distImg = document.getElementById("distIcon");
const floorsImg = document.getElementById("floorsIcon");

// Timeline
const timeline = document.getElementById("fullTimeline");
const fullTimeline = document.getElementById("emptyTimeline");

let hasElevation = true;
let vibrateOnGoalAchieve = true;
let fullFill = "white";
let emptyFill = "white";

// Update the clock every second
clock.granularity = "seconds";
clock.ontick = (evt) =>
{
  let today = evt.date;
  let hours = today.getHours();

  if (preferences.clockDisplay === "12h")
  {
    // 12h format
    hours = hours % 12 || 12;
  }
  else
  {
    // 24h format
    hours = util.zeroPad(hours);
  }

  /* DISPLAY TIME */
  let mins = util.zeroPad(today.getMinutes());
  let secs = util.zeroPad(today.getSeconds());
  main.text = `${hours}:${mins}:${secs}`;

  /* DATE */
  let d = new Date();
  currDate.text = `${util.getWeekday(d.getDay())}, ${util.getMonth(d.getMonth()).substring(0, 3)} ${d.getDate()}`;

  /* TIMELINE */
  let minInDay = 60 * 24;
  let currMin = (today.getHours() * 60) + today.getMinutes();
  timeline.x2 = fullTimeline.x1 + ((currMin / minInDay) * (fullTimeline.x2 - fullTimeline.x1));

  if (!userActivity.today.local.elevationGain) // Device ID for Versa Lite
  {
    floorsImg.style.display = "none";
    elevationGain.style.display = "none";
  }
 
  /* BATTERY */
  let batteryLevel = Math.floor(battery.chargeLevel);
  batt.text = `${batteryLevel}%`;

  if (batteryLevel >= 95) battImg.href = "icons/battery_indc_100_48px.png";
  else if (batteryLevel >= 75) battImg.href = "icons/battery_indc_75_48px.png";
  else if (batteryLevel >= 50) battImg.href = "icons/battery_indc_50_48px.png";
  else if (batteryLevel >= 25) battImg.href = "icons/battery_indc_25_48px.png";
  else battImg.href = "icons/battery_indc_0_48px.png";

  /* ACTIVITY MONITORS */
  if (appbit.permissions.granted("access_activity"))
  {
    // Set stat text
    steps.text = `${userActivity.today.adjusted.steps}`;
    activeMinutes.text = `${userActivity.today.adjusted.activeMinutes}`;
    calories.text = `${userActivity.today.adjusted.calories}`;
    distance.text = `${util.getMiles(userActivity.today.adjusted.distance)}`;
    if (userActivity.today.local.elevationGain) elevationGain.text = `${userActivity.today.adjusted.elevationGain}`;

    // Set stat image. If goal is reached, fill icon.
    checkGoals(userActivity.today.adjusted.steps, userActivity.goals.steps, "steps");
    checkGoals(userActivity.today.adjusted.activeMinutes, userActivity.goals.activeMinutes, "am");
    checkGoals(userActivity.today.adjusted.calories, userActivity.goals.calories, "cals");
    checkGoals(userActivity.today.adjusted.distance, userActivity.goals.distance, "dist");
    if (userActivity.today.local.elevationGain) checkGoals(userActivity.today.adjusted.elevationGain, userActivity.goals.elevationGain, "floors");
  }
}

function checkGoals(actual, goal, icon)
{
  let obj = document.getElementById(`${icon}Icon`);

  if (actual >= goal)
  {
    // Changed from Empty -> Filled
    if (vibrateOnGoalAchieve && obj.href === `icons/stat_${icon}_open_48px.png`)
    {
      vibration.start("bump");
    }

    // Fill icon
    obj.href = `icons/stat_${icon}_solid_48px.png`;
    obj.style.fill = fullFill;
  }
  else
  {
    obj.href = `icons/stat_${icon}_open_48px.png`;
    obj.style.fill = emptyFill;
  }
}

function changeFill(id, val)
{
  document.getElementsByClassName(id).forEach(function (i)
  {
    i.style.fill = val;
  });

  let obj = document.getElementById(id);

  if (obj)
  {
    obj.style.fill = val;
  }
}

deviceSettings.initialize(settingsCallback);

// Set settings
function settingsCallback(data)
{
  if (data.mainClockColor)
  {
    changeFill("time", data.mainClockColor);
  }

  if (data.dateColor)
  {
    changeFill("date", data.dateColor);
  }

  if (data.indcIconColor)
  {
    changeFill("indcIcon", data.indcIconColor);
  }

  if (data.emptyStatIconColor)
  {
    emptyFill = data.emptyStatIconColor;
  }

  if (data.fullStatIconColor)
  {
    fullFill = data.fullStatIconColor;
  }

  if (data.statColor)
  {
    changeFill("statText", data.statColor);
  }

  if (data.timeFillColor)
  {
    changeFill("fullTimeline", data.timeFillColor);
  }

  if (data.vibrateToggle)
  {
    vibrateOnGoalAchieve = data.vibrateToggle;
  }
}

if (HeartRateSensor)
{
   const hrs = new HeartRateSensor();

   hrs.addEventListener("reading", () =>
   {
     heartRate.text = `${hrs.heartRate || none}`;
   });

   hrs.start();
}
