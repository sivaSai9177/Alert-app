import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface SidebarStore {
  // Sidebar state
  isOpen: boolean;
  isMobileOpen: boolean;
  activeItem: string | null;
  expandedGroups: string[];
  activeTeam: string | null;
  
  // Actions
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setActiveItem: (item: string | null) => void;
  toggleGroup: (groupId: string) => void;
  resetGroups: () => void;
  setActiveTeam: (teamId: string | null) => void;
}

// Create storage that works on both web and mobile
const storage = Platform.OS === 'web'
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => AsyncStorage);

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      // Initial state
      isOpen: true,
      isMobileOpen: false,
      activeItem: null,
      expandedGroups: [],
      activeTeam: null,
      
      // Actions
      setOpen: (open) => set({ isOpen: open }),
      
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setMobileOpen: (open) => set({ isMobileOpen: open }),
      
      toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      
      setActiveItem: (item) => set({ activeItem: item }),
      
      toggleGroup: (groupId) => set((state) => ({
        expandedGroups: state.expandedGroups.includes(groupId)
          ? state.expandedGroups.filter(id => id !== groupId)
          : [...state.expandedGroups, groupId]
      })),
      
      resetGroups: () => set({ expandedGroups: [] }),
      
      setActiveTeam: (teamId) => set({ activeTeam: teamId }),
    }),
    {
      name: 'sidebar-storage',
      storage,
      partialize: (state) => ({
        isOpen: state.isOpen,
        expandedGroups: state.expandedGroups,
      }),
    }
  )
);