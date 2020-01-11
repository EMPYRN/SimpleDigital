import clock from "clock"; // Used for clock tick
import { preferences } from "user-settings"; // Used for pref time format
import { battery } from "power";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { today, goals } from "user-activity"
import document from "document"

import * as deviceSettings from "./deviceSettings";

import * as util from "../common/utils.js";
import { stringifyJSON } from "fp-ts/lib/Either";

const INDICATOR_SECT = document.getElementById("indicator-section");
const DATE_SECT = document.getElementById("date-section");
const TIME_SECT = document.getElementById("time-section");
const TIMELINE_SECT = document.getElementById("timeline-section");
const STAT_SECT = document.getElementById("stat-section");

const BATTERY_ICON = document.getElementById("battery-icon");
const BATTERY_TEXT = document.getElementById("battery-text");
const HEART_RATE_ICON = document.getElementById("heart-rate-icon");
const HEART_RATE_TEXT = document.getElementById("heart-rate-text");
const DATE_TEXT = document.getElementById("date-text");
const TIME_TEXT = document.getElementById("time-text");
const FLOORS_ICON = document.getElementById("floors-icon");
const FLOORS_TEXT = document.getElementById("floors-text");
const DISTANCE_ICON = document.getElementById("distance-icon");
const DISTANCE_TEXT = document.getElementById("distance-text");
const STEPS_ICON = document.getElementById("steps-icon");
const STEPS_TEXT = document.getElementById("steps-text");
const MINUTES_ICON = document.getElementById("minutes-icon");
const MINUTES_TEXT = document.getElementById("minutes-text");
const CALORIES_ICON = document.getElementById("calories-icon");
const CALORIES_TEXT = document.getElementById("calories-text");
const TIMELINE_FULL = document.getElementById("timeline-full");
const TIMELINE_EMPTY = document.getElementById("timeline-empty");
const TIMELINE_ANIMATION = document.getElementById("timeline-animation");
let heartRateListener = null;

// Settings-related variables
let statIconFullColor = "#ffffff";
let statIconEmptyColor = "#ffffff";
let displaySeconds = true;
let displayTimeline = true;
let uiSize = 2; // 0 (small), 1 (medium), or 2 (large)
let dateFormat = { day: "long", month: "long", date: "2-digit" }

/**
 * Init the clock, heart rate sensor, and device settings
 */
export function init()
{
    clock.granularity = "seconds";
    clock.ontick = (event) => { updateClock(event); };

    if (appbit.permissions.granted("access_heart_rate") && HeartRateSensor)
    {
        heartRateListener = new HeartRateSensor();
        heartRateListener.start();
    }

    deviceSettings.initialize(settingsCallback);
}

/**
 * Updates the clock face every second
 */
export function updateClock(event)
{
    // Time //

    let hours = event.date.getHours();
    let minutes = event.date.getMinutes();
    let seconds = event.date.getSeconds();

    if (preferences.clockDisplay === "24h")
    {
        TIME_TEXT.text = `${util.zeroPad(hours)}:${util.zeroPad(minutes)}`;
    }
    else
    {
        TIME_TEXT.text = `${util.zeroPad(hours % 12 || 12)}:${util.zeroPad(minutes)}`;
    }

    if (displaySeconds)
    {
        TIME_TEXT.text += `:${util.zeroPad(seconds)}`
    }
    
    // Date //

    let dateFormats = {
        "date": {
            "2-digit": event.date.getDate()
        },
        "day": {
            "long": `${util.WEEKDAY_LONG[event.date.getDay()]}, `,
            "short": `${util.WEEKDAY_SHORT[event.date.getDay()]}, `
        },
        "month": {
            "long": `${util.MONTH_LONG[event.date.getMonth()]} `,
            "short": `${util.MONTH_SHORT[event.date.getMonth()]} `,
            "2-digit": event.date.getMonth() + 1
        },
        "year": {
            "long": event.date.getFullYear()
        }
    }

    let text = []
    for (let key in dateFormat)
    {
        text.push(`${dateFormats[key][dateFormat[key]]}`);
    }

    if (isNaN(text[0]))
    {
        DATE_TEXT.text = text.join("");
    }
    else
    {
        DATE_TEXT.text = text.join("/");
    }

    // Battery //

    let batteryLevel = battery.chargeLevel;
    BATTERY_TEXT.text = `${batteryLevel}%`;

    if (batteryLevel >= 95)
        BATTERY_ICON.href = "icons/battery_indc_100_48px.png";
    else if (batteryLevel >= 75)
        BATTERY_ICON.href = "icons/battery_indc_75_48px.png";
    else if (batteryLevel >= 50)
        BATTERY_ICON.href = "icons/battery_indc_50_48px.png";
    else if (batteryLevel >= 25)
        BATTERY_ICON.href = "icons/battery_indc_25_48px.png";
    else
        BATTERY_ICON.href = "icons/battery_indc_0_48px.png";

    // Heart Rate //

    if (appbit.permissions.granted("access_heart_rate") && heartRateListener && heartRateListener.heartRate)
    {
        HEART_RATE_TEXT.text = `${heartRateListener.heartRate}`;
    }
    else
    {
        HEART_RATE_TEXT.text = "";
    }

    // Timeline //

    if (displayTimeline)
    {
        let minutesInADay = 60 * 24;
        let currentMinutes = (hours * 60) + minutes;
        TIMELINE_ANIMATION.groupTransform.scale.x = currentMinutes / minutesInADay;
        TIMELINE_ANIMATION.groupTransform.scale.y = 1;
    }

    // Stat Indicators //

    if (appbit.permissions.granted("access_activity"))
    {
        let todaysActivity = today.adjusted;

        let activities = {
            "floors": {
                goal: goals.elevationGain,
                today: todaysActivity.elevationGain,
                text: FLOORS_TEXT,
                icon: FLOORS_ICON
            },
            "distance": {
                goal: goals.distance,
                today: todaysActivity.distance,
                text: DISTANCE_TEXT,
                icon: DISTANCE_ICON
            },
            "steps": {
                goal: goals.steps,
                today: todaysActivity.steps,
                text: STEPS_TEXT,
                icon: STEPS_ICON
            },
            "minutes": {
                goal: goals.activeMinutes,
                today: todaysActivity.activeMinutes,
                text: MINUTES_TEXT,
                icon: MINUTES_ICON
            },
            "calories": {
                goal: goals.calories,
                today: todaysActivity.calories,
                text: CALORIES_TEXT,
                icon: CALORIES_ICON
            }
        }

        for (let activity in activities)
        {
            if (activities[activity].today !== undefined)
            {
                activities[activity].text.text = activities[activity].today;
                checkGoal(activities[activity].today, activities[activity].goal, activity);
            }
            else
            {
                activities[activity].text.text = "";
                activities[activity].icon.href = "";
            }
        }
    }
}

/**
 * Checks a given goal for completion; on completion, it will replace a open icon
 * with its closed version
 * @param {*} current 
 * @param {*} goal 
 * @param {*} activity 
 */
export function checkGoal(current, goal, activity)
{
    let activityToIcon = {
        floors: "floors",
        distance: "dist",
        steps: "steps",
        minutes: "am",
        calories: "cals"
    };

    let icon = document.getElementById(`${activity}-icon`);

    if (current >= goal)
    {
        icon.href = `icons/stat_${activityToIcon[activity]}_solid_48px.png`;
        icon.style.fill = statIconFullColor;
    }
    else
    {
        icon.href = `icons/stat_${activityToIcon[activity]}_open_48px.png`;
        icon.style.fill = statIconEmptyColor;
    }
}

/**
 * Invoked when a setting is changed and on program start.
 * Modifies appropriate SVG elements in conjunction with their setting
 * @param {} settings 
 */
export function settingsCallback(settings)
{
    // General Settings //

    if (settings["dateFormat"] !== undefined)
    {
        dateFormat = settings["dateFormat"]["values"][0]["value"];
    }

    if (settings["uiSize"] !== undefined)
    {
        uiSize = settings["uiSize"]["selected"][0];

        let indicatorTexts = document.getElementsByClassName("indicator-text");
        indicatorTexts.forEach(function(indicator) {
            indicator.style.fontSize = uiSize == 2 ? 24 : uiSize == 1 ? 22 : 20;
        });

        let statTexts = document.getElementsByClassName("stat-text");
        statTexts.forEach(function(stat) {
            stat.style.fontSize = uiSize == 2 ? 24 : uiSize == 1 ? 22 : 20;
        });

        let indicatorIcons = document.getElementsByClassName("indicator-icon");
        indicatorIcons.forEach(function(indicator) {
            indicator.height = uiSize == 2 ? 32 : uiSize == 1 ? 30 : 28;
            indicator.width = uiSize == 2 ? 32 : uiSize == 1 ? 30 : 28;
        });

        let statIcons = document.getElementsByClassName("stat-icon");
        statIcons.forEach(function(stat) {
            stat.height = uiSize == 2 ? 32 : uiSize == 1 ? 30 : 28;
            stat.width = uiSize == 2 ? 32 : uiSize == 1 ? 30 : 28;
        });
    }

    if (settings["secondsShow"] !== undefined)
    {
        displaySeconds = settings["secondsShow"];
    }

    if (settings["timelineShow"] !== undefined)
    {
        displayTimeline = settings["timelineShow"];
        TIMELINE_SECT.style.display = settings["timelineShow"] ? "inline" : "none";
    }

    // Color Settings //

    let coloredElements = {
        "clockColor": [ TIME_TEXT ],
        "dateColor": [ DATE_TEXT ],
        "batteryIconColor": [ BATTERY_ICON ],
        "heartRateIconColor": [ HEART_RATE_ICON ],
        "emptyStatIconColor": [ ], // Handled individually
        "fullStatIconColor": [ ], // Handled individually
        "textColor": [ 
            BATTERY_TEXT, 
            HEART_RATE_TEXT, 
            FLOORS_TEXT, 
            DISTANCE_TEXT, 
            STEPS_TEXT, 
            MINUTES_TEXT, 
            CALORIES_TEXT 
        ],
        "timelineFullColor": [ TIMELINE_FULL ]
    }

    if (settings["emptyStatIconColor"] !== undefined)
    {
        statIconEmptyColor = settings["emptyStatIconColor"];
    }

    if (settings["fullStatIconColor"] !== undefined)
    {
        statIconFullColor = settings["fullStatIconColor"];
    }

    for (let key in coloredElements)
    {
        if (settings[key] !== undefined)
        {
            coloredElements[key].forEach(
                function(element) 
                {
                    element.style.fill = settings[key];
                }
            );
        }
    }
}