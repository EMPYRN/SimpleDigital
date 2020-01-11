import { processMessageFromCompanion } from "../app/kpay/release/kpay_core";
import * as util from "../common/utils.js";

function mySettings(props)
{
    let currentDate = new Date();

    return (
        <Page>
            <Section title="General Options">
                <Select value={0}
                    label="Date Format"
                    settingsKey="dateFormat"
                    options={[
                        { 
                            name: `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
                            value: {
                                year: "long",
                                month: "2-digit",
                                date: "2-digit"
                            }
                        },
                        { 
                            name: `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`,
                            value: {
                                month: "2-digit",
                                date: "2-digit",
                                year: "long"
                            }
                        },
                        { 
                            name: `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
                            value: {
                                date: "2-digit",
                                month: "2-digit",
                                year: "long"
                            }
                        },
                        { 
                            name: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
                            value: {
                                month: "2-digit",
                                date: "2-digit"
                            }
                        },
                        {
                            name: `${util.WEEKDAY_LONG[currentDate.getDay()]}, ${util.MONTH_LONG[currentDate.getMonth()]} ${currentDate.getDate()}`,
                            value: {
                                day: "long",
                                month: "long",
                                date: "2-digit"
                            }
                        },
                        {
                            name: `${util.WEEKDAY_LONG[currentDate.getDay()]}, ${util.MONTH_SHORT[currentDate.getMonth()]} ${currentDate.getDate()}`,
                            value: {
                                day: "long",
                                month: "short",
                                date: "2-digit"
                            }
                        },
                        {
                            name: `${util.WEEKDAY_SHORT[currentDate.getDay()]}, ${util.MONTH_SHORT[currentDate.getMonth()]} ${currentDate.getDate()}`,
                            value: {
                                day: "short",
                                month: "short",
                                date: "2-digit"
                            }
                        }
                    ]}
                />

                <Select 
                    label="Font & Icon Size"
                    settingsKey="uiSize"
                    options={[
                        { name: "Small" },
                        { name: "Medium" },
                        { name: "Large" }
                    ]}
                />

                <Toggle 
                    settingsKey="secondsShow"
                    label="Show seconds"
                />

                <Toggle
                    settingsKey="timelineShow"
                    label="Show digital timeline"
                />
            </Section>

            {util.COLORED_OPTIONS.map(([title, key]) =>
                <Section title={ title }>
                    <ColorSelect 
                        settingsKey={ key }
                        colors={ util.COLOR_LIST }
                    />
                </Section>
            )}

            <Section description="Warning: this will reset ALL settings to their default (unset) state!">
                <Button
                    label="Reset Settings"
                    onClick={() =>  {
                        console.log("reset");
                        props.settingsStorage.clear();
                        props.settingsStorage.setItem("reset", "true");
                    }}
                />
            </Section>

            <Section>
                <Text italic>
                    Get more clock faces <Link source="http://clocks.theempyreancompany.com">here</Link>!
                </Text>
                <Text italic>
                    For feedback and support email <Link source="mailto:contact@theempyreancompany.com">contact@theempyreancompany.com</Link>.
                </Text>
            </Section>
        </Page>
    );
}

registerSettingsPage(mySettings);
