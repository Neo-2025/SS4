import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Agency, AgencyGroupType } from '../models/agency';

// Create SSR-compatible storage
const storage = typeof window !== 'undefined' 
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }));

interface AgencyState {
  // Agency data
  agencies: Agency[];
  agencyGroups: Record<AgencyGroupType, string[]>; // Map of group type to CCNs
  
  // Agency actions
  addAgency: (agency: Agency) => void;
  removeAgency: (ccn: string) => void;
  updateAgency: (ccn: string, agency: Partial<Agency>) => void;
  
  // Group actions
  addToGroup: (ccn: string, groupType: AgencyGroupType) => void;
  removeFromGroup: (ccn: string, groupType: AgencyGroupType) => void;
  
  // Utility actions
  clear: () => void;
  setAgencies: (agencies: Agency[]) => void;
  sync: (dbAgencies: Agency[]) => void; // Merge with database agencies
}

export const useAgencyStore = create<AgencyState>()(
  persist(
    (set, get) => ({
      // Initial state
      agencies: [],
      agencyGroups: {
        'Org': [],
        'Comp': [],
        'Target': []
      },
      
      // Agency actions
      addAgency: (agency: Agency) => set(state => {
        // Check if agency already exists
        const exists = state.agencies.some(a => a.ccn === agency.ccn);
        if (exists) {
          return state; // No change
        }
        
        return {
          agencies: [...state.agencies, agency]
        };
      }),
      
      removeAgency: (ccn: string) => set(state => ({
        agencies: state.agencies.filter(a => a.ccn !== ccn),
        // Also remove from all groups
        agencyGroups: {
          'Org': state.agencyGroups['Org'].filter(id => id !== ccn),
          'Comp': state.agencyGroups['Comp'].filter(id => id !== ccn),
          'Target': state.agencyGroups['Target'].filter(id => id !== ccn)
        }
      })),
      
      updateAgency: (ccn: string, updates: Partial<Agency>) => set(state => ({
        agencies: state.agencies.map(agency => 
          agency.ccn === ccn ? { ...agency, ...updates } : agency
        )
      })),
      
      // Group actions
      addToGroup: (ccn: string, groupType: AgencyGroupType) => set(state => {
        // Check if agency exists in the store
        const agencyExists = state.agencies.some(a => a.ccn === ccn);
        if (!agencyExists) {
          console.warn(`Cannot add non-existent agency ${ccn} to group ${groupType}`);
          return state;
        }
        
        // Check if already in group
        const alreadyInGroup = state.agencyGroups[groupType].includes(ccn);
        if (alreadyInGroup) {
          return state;
        }
        
        return {
          agencyGroups: {
            ...state.agencyGroups,
            [groupType]: [...state.agencyGroups[groupType], ccn]
          }
        };
      }),
      
      removeFromGroup: (ccn: string, groupType: AgencyGroupType) => set(state => ({
        agencyGroups: {
          ...state.agencyGroups,
          [groupType]: state.agencyGroups[groupType].filter(id => id !== ccn)
        }
      })),
      
      // Utility actions
      clear: () => set({ 
        agencies: [],
        agencyGroups: { 'Org': [], 'Comp': [], 'Target': [] }
      }),
      
      setAgencies: (agencies: Agency[]) => set({ agencies }),
      
      // Sync with database agencies (merge local and DB)
      sync: (dbAgencies: Agency[]) => set(state => {
        // Create a map of existing agencies by CCN
        const existing = new Map(state.agencies.map(a => [a.ccn, a]));
        
        // Add/update with database agencies
        dbAgencies.forEach(agency => {
          existing.set(agency.ccn, agency);
        });
        
        return {
          agencies: Array.from(existing.values())
        };
      })
    }),
    {
      name: 'agency-storage',
      storage // Use our SSR-compatible storage
    }
  )
);

// Helper function for components that need to access the store outside of React
export const getAgencyStore = () => {
  // Handle SSR case
  if (typeof window === 'undefined') {
    return {
      agencies: [],
      agencyGroups: { 'Org': [], 'Comp': [], 'Target': [] },
      addAgency: () => {},
      removeAgency: () => {},
      updateAgency: () => {},
      addToGroup: () => {},
      removeFromGroup: () => {},
      clear: () => {},
      setAgencies: () => {},
      sync: () => {}
    };
  }
  
  return useAgencyStore.getState();
}; 