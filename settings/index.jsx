function mySettings()
{
  const colorList =
  [
        {color: "#FFFFFF"}, // fb-white
        {color: "#A0A0A0"}, // fb-light-gray
        {color: "#505050"}, // fb-dark-gray
        {color: "#303030"}, // fb-extra-dark-gray
        {color: "#000000"}, // fb-black
        {color: "#1B2C40"}, // fb-slate-press
        {color: "#7090B5"}, // fb-slate
        {color: "#BCD8F8"}, // fb-lavender
        {color: "#3182DE"}, // fb-blue
        {color: "#14D3F5"}, // fb-cyan
        {color: "#3BF7DE"}, // fb-aqua
        {color: "#5B4CFF"}, // fb-indigo
        {color: "#8080FF"}, // fb-cerulean
        {color: "#BD4EFC"}, // fb-purple
        {color: "#A51E7C"}, // fb-plum
        {color: "#D828B8"}, // fb-violet
        {color: "#F83478"}, // fb-pink
        {color: "#F80070"}, // fb-magenta
        {color: "#F83C40"}, // fb-red
        {color: "#FC6B3A"}, // fb-orange
        {color: "#FFCC33"}, // fb-peach
        {color: "#E4FA3C"}, // fb-yellow
        {color: "#B8FC68"}, // fb-lime
        {color: "#5BE37D"}, // fb-mint
        {color: "#00A629"}, // fb-green
        {color: "#134022"}, // fb-green-press
        {color: "#394003"}, // fb-yellow-press
  ];

  const coloredOptions =
  [
    ["Clock Color", "mainClockColor"],
    ["Date Color", "dateColor"],
    ["Battery & Heart-Rate Icon Color", "indcIconColor"],
    ["Empty Stat Icon Color", "emptyStatIconColor"],
    ["Full Stat Icon Color", "fullStatIconColor"],
    ["Stat Text Color", "statColor"],
    ["Time Line Fill Color", "timeFillColor"]
  ]

  return (
    <Page>
      {coloredOptions.map(([title, key]) =>
          <Section
            title={ title }>
            <ColorSelect
              settingsKey={ key }
              colors={ colorList } />
          </Section>
      )}

      <Section
        title={<Text bold>Vibration on Goal Achieve</Text>}>
        <Toggle
          settingsKey="vibrateToggle"
          label="Vibrate on goal achieve"
        />
      </Section>

      <Section>
        <Button
          label="Reset to Defaults"
          onClick={() => console.log("Clicked!")}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
