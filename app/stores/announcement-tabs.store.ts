import {create} from "zustand";
import type {TabProps} from "@shopify/polaris";
import {ANNOUNCEMENT_TABS, ANNOUNCEMENT_TYPE, EAnnouncementType} from "../types/announcement";

const BaseTabs: TabProps[] = [
  {id: ANNOUNCEMENT_TABS.BASIC, content: 'Basic'},
  {id: ANNOUNCEMENT_TABS.ANNOUNCEMENT_TEXT, content: 'Announcement text'},
  {id: ANNOUNCEMENT_TABS.CTA, content: 'CTA'},
  {id: ANNOUNCEMENT_TABS.BACKGROUND, content: 'Background'},
  {id: ANNOUNCEMENT_TABS.OTHER, content: 'Other'},
]

const CountdownTabs: TabProps[] = [
  ...BaseTabs.slice(0, 2),
  {id: ANNOUNCEMENT_TABS.COUNTDOWN, content: 'Countdown'},
  ...BaseTabs.slice(2),
]


interface AnnouncementStoreFunctions {
  switchTab: (index: number) => void;
  announcementType: (type: EAnnouncementType) => void;
}

interface AnnouncementTabState {
  tabs: TabProps[];
  activeTab: number;
  actions: AnnouncementStoreFunctions
}

const useAnnouncementTabStore = create<AnnouncementTabState>((set) => ({
  tabs: BaseTabs,
  activeTab: 0,
  errors: [],

  actions: {
    switchTab: (index: number) => {
      set({activeTab: index});
    },
    announcementType: (type: EAnnouncementType) => {
      set({activeTab: 0});
      if (type === ANNOUNCEMENT_TYPE.COUNTDOWN) {
        set({tabs: CountdownTabs});
      } else {
        set({tabs: BaseTabs});
      }
    }
  },
}));

export const useAnnouncementTabs = () => {
  return useAnnouncementTabStore((state) => state.tabs)
};

export const useAnnouncementActiveTab = () => {
  return useAnnouncementTabStore((state) => state.activeTab)
};

export const useAnnouncementTabActions = () => {
  return useAnnouncementTabStore((state) => state.actions)
};
