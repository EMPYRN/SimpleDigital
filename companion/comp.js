import * as messaging from "messaging";
import { settingsStorage } from "settings";

export function initialize()
{
  // On setting change, send new value if different
  settingsStorage.addEventListener("change", evt =>
  {
    if (evt.oldValue !== evt.newValue)
    {
      sendValue(evt.key, evt.newValue);
    }
  });
}

// Send value is exists
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
