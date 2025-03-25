import {create} from "zustand";
import {UpdateAnnouncement} from "../../drizzle/schema/announcement";

interface AnnouncementStoreFunctions {
  updateAnnouncement: (announcement: Partial<UpdateAnnouncement>) => void;
}

interface AnnouncementStore {
  announcement: UpdateAnnouncement | null;
  errors: string[]
  actions: AnnouncementStoreFunctions
}

const useAnnouncementStore = create<AnnouncementStore>((set,getState) => ({
  announcement: null,
  errors: [],

  actions: {
    updateAnnouncement: (announcementData: Partial<UpdateAnnouncement>) => {
      set({errors: []});

      set((state) => {
        const updatedAnnouncement = state.announcement
          ? { ...state.announcement, ...announcementData }
          : announcementData as UpdateAnnouncement;

        return { announcement: updatedAnnouncement };
      });
    },
  },
}));

export const useAnnouncementData = () => {
  return useAnnouncementStore((state) => state.announcement)
};

export const useAnnouncementActions = () => {
  return useAnnouncementStore((state) => state.actions)
};
