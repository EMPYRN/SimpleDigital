import { me } from "appbit";
import { me as device } from "device";
import * as fs from "fs";
import * as messaging from "messaging";

const SETTINGS_TYPE = "json";
const SETTINGS_FILE = "settings.json";

let settings, onsettingschange;

export function initialize(callback)
{
    settings = loadSettings();
    onsettingschange = callback;
    onsettingschange(settings);
}

// Received message containing settings data
messaging.peerSocket.addEventListener("message", function(evt)
{
    settings[evt.data.key] = evt.data.value;
    onsettingschange(settings);
});

// Register for the unload event
me.addEventListener("unload", saveSettings);

// Load settings from filesystem
function loadSettings()
{
    try
    {
        return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
    }
    catch (e)
    {
        return { };
    }
}

// Save settings to the filesystem
function saveSettings()
{
    fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}
