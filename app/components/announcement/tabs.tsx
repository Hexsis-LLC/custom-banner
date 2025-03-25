import {ANNOUNCEMENT_TABS, EAnnouncementTabs} from "../../types/announcement";
import {BasicTab} from "./tabs/basic";

export function AnnouncementTabs(props:{tabId: EAnnouncementTabs}) {
    switch (props.tabId) {
        case ANNOUNCEMENT_TABS.BASIC:
            return <BasicTab></BasicTab>
        case ANNOUNCEMENT_TABS.ANNOUNCEMENT_TEXT:
            return <></>
        case ANNOUNCEMENT_TABS.COUNTDOWN:
            return <></>
        case ANNOUNCEMENT_TABS.CTA:
            return <></>
        case ANNOUNCEMENT_TABS.BACKGROUND:
            return <></>
        case ANNOUNCEMENT_TABS.OTHER:
            return <></>
    }
}
