import * as messaging from "messaging";
import { settingsStorage } from "settings";

import * as util from "../common/utils.js";

export function initialize()
{
    // On setting change, send new value if different
    settingsStorage.addEventListener("change", evt =>
    {
        if (evt.oldValue !== evt.newValue)
        {
            if (evt.key === "reset" && evt.newValue === "true")
            {
                setDefaults();
            }
            else
            {
                sendValue(evt.key, evt.newValue);
            }
            
        }
    });
    
    messaging.peerSocket.addEventListener("open", evt =>
    {
        setDefaults();
    });
}

export function setDefaults()
{
    setDefaultSetting("dateFormat", {"selected":[4], "values": [{"value": {day: "long", month: "long", date: "2-digit" }}]});
    setDefaultSetting("uiSize", {"selected":[2]})
    setDefaultSetting("secondsShow", true);
    setDefaultSetting("timelineShow", true);

    util.COLORED_OPTIONS.forEach(function(elem)
    {
        setDefaultSetting(elem[1], "#ffffff");
    });
}

function setDefaultSetting(key, value)
{
    if (settingsStorage.getItem(key) === null)
    {
        settingsStorage.setItem(key, JSON.stringify(value)); // Changes display of setting
        sendValue(key, JSON.stringify(value)); // Actually sets the value
    }
}

// Send value if exists
function sendValue(key, val)
{
    if (val)
    {
        sendSettingData({ key: key, value: JSON.parse(val) });
    }
}

// Send setting data to peer
function sendSettingData(data)
{
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN)
    {
        messaging.peerSocket.send(data);
    }
    else
    {
        console.log("No peerSocket connection");
    }
}
