/**** BEGIN KPAY IMPORTS - REQUIRED ****/
/*
 * If you want (a lot of) logging from the KPay library,
 * replace "release" with "debug" in the import paths for
 * ALL KPAY IMPORTS below
 *    ==> DO NOT MIX RELEASE AND DEBUG IMPORTS!
 */
// required imports
import * as kpay from './kpay/release/kpay.js';
import * as kpay_common from '../common/kpay/kpay_common.js';

/* Choose which type of "companion => phone communications" you want to use:
 *   - file transfer: is more reliable, uses more memory
 *          ==> import './kpay/release/kpay_filetransfer.js';
 *   - normal messaging: less reliable then file transfer, might cause frustration with the user if messaging fails, but uses less memory
 *          ==> import './kpay/release/kpay_messaging.js';
 * If you do not run into memory issues with your app or clockface, we recommend you use the file transfer communications
 */
import './kpay/release/kpay_filetransfer.js';
//import './kpay/release/kpay_messaging.js';

// optional imports, remove if not needed to save memory
import './kpay/release/kpay_dialogs.js';			// remove if you handle KPay dialogs yourself

// remove this is you want to choose yourself when the purchase starts,
// leave it in if you want the purchase to start automatically (either after a long trial or immediately at startup of the app)
// If you want the purchase to start immediately after install, just set the trial time to 0 in the product settings in your kpay account
import './kpay/release/kpay_time_trial.js';

/*
 * Removing the import below can save up to 8.5kb of extra memory.
 *
 * BEWARE: Only do this when you really need that extra memory and cannot get it by optimizing your own code!
 * Removing this import will disable the message checksum validation, which means the KPay lib
 * can no longer detect if the messages received from the KPay server are tampered with.
 * Eventhough the risk of your app being cracked are very small, removing this import makes it a possibility!
 */
import './kpay/release/kpay_msg_validation.js';			// remove if you need extra memory and are willing to take the risk described above
/**** END KPAY IMPORTS ****/

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

// K-Pay Init
kpay.initialize();

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
