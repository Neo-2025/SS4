import { v4 as uuidv4 } from 'uuid';
import { 
  AgencyData, 
  AgencyGroup, 
  AgencyGroupType, 
  ClientGroup, 
  GroupedAgency 
} from '../../models';
import { ResilientApiGateway } from '../../api/resilience/resilient-api-gateway';

/**
 * Agency Management Service - Handles multi-agency operations
 */
export class AgencyManagementService {
  private agencies: Map<string, AgencyData> = new Map();
  private clientGroups: Map<string, ClientGroup> = new Map();
  private agencyGroups: Map<string, AgencyGroup[]> = new Map();
  private resilientApiGateway: ResilientApiGateway;
  
  constructor(apiGateway: ResilientApiGateway) {
    this.resilientApiGateway = apiGateway;
    
    // Initialize a default client group
    const defaultGroupId = uuidv4();
    this.clientGroups.set(defaultGroupId, {
      id: defaultGroupId,
      clientId: 'default-client',
      name: 'Default Group',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agencies: []
    });
  }
  
  /**
   * Add an agency by CCN
   * @param ccn The agency CCN
   * @param apiCall The API call function to fetch agency data
   */
  async addAgency(ccn: string, apiCall: (ccn: string) => Promise<AgencyData>): Promise<AgencyData> {
    // Check if agency already exists
    if (this.agencies.has(ccn)) {
      return this.agencies.get(ccn)!;
    }
    
    // Fetch agency data with resilience
    const agencyData = await this.resilientApiGateway.getAgencyData(apiCall, ccn);
    
    // Store agency data
    this.agencies.set(ccn, agencyData);
    
    return agencyData;
  }
  
  /**
   * Get agency data by CCN
   * @param ccn The agency CCN
   */
  getAgency(ccn: string): AgencyData | undefined {
    return this.agencies.get(ccn);
  }
  
  /**
   * List all agencies
   */
  listAgencies(): AgencyData[] {
    return Array.from(this.agencies.values());
  }
  
  /**
   * Group an agency
   * @param ccn The agency CCN
   * @param type The group type (Org, Comp, Target)
   * @param clientGroupId Optional client group ID (uses default if not provided)
   */
  groupAgency(ccn: string, type: AgencyGroupType, clientGroupId?: string): AgencyGroup | null {
    const agency = this.agencies.get(ccn);
    if (!agency) {
      return null;
    }
    
    // Get client group (use default if not provided)
    const groupId = clientGroupId || Array.from(this.clientGroups.keys())[0];
    const clientGroup = this.clientGroups.get(groupId);
    if (!clientGroup) {
      return null;
    }
    
    // Check if agency is already in a group
    const existingGroups = this.agencyGroups.get(groupId) || [];
    const existingIndex = existingGroups.findIndex(
      group => group.agencyId === ccn
    );
    
    // Create new agency group
    const agencyGroup: AgencyGroup = {
      id: uuidv4(),
      agencyId: ccn,
      type,
      displayOrder: existingGroups.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update or add the agency group
    if (existingIndex !== -1) {
      existingGroups[existingIndex] = agencyGroup;
    } else {
      existingGroups.push(agencyGroup);
    }
    
    // Update the maps
    this.agencyGroups.set(groupId, existingGroups);
    clientGroup.agencies = existingGroups;
    this.clientGroups.set(groupId, clientGroup);
    
    return agencyGroup;
  }
  
  /**
   * List agencies by group type
   * @param type The group type to filter by
   * @param clientGroupId Optional client group ID (uses default if not provided)
   */
  listAgenciesByType(type: AgencyGroupType, clientGroupId?: string): GroupedAgency[] {
    // Get client group (use default if not provided)
    const groupId = clientGroupId || Array.from(this.clientGroups.keys())[0];
    const agencyGroups = this.agencyGroups.get(groupId) || [];
    
    // Filter by type
    const filteredGroups = agencyGroups.filter(group => group.type === type);
    
    // Map to grouped agencies
    return filteredGroups.map(group => {
      const agency = this.agencies.get(group.agencyId);
      return {
        ccn: group.agencyId,
        name: agency?.name || 'Unknown Agency',
        groupType: group.type,
        state: agency?.state || 'Unknown',
        groupId
      };
    });
  }
  
  /**
   * Create a new client group
   * @param name The group name
   * @param clientId The client ID
   */
  createClientGroup(name: string, clientId: string): ClientGroup {
    const groupId = uuidv4();
    const clientGroup: ClientGroup = {
      id: groupId,
      clientId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      agencies: []
    };
    
    this.clientGroups.set(groupId, clientGroup);
    this.agencyGroups.set(groupId, []);
    
    return clientGroup;
  }
  
  /**
   * Get a client group by ID
   * @param groupId The group ID
   */
  getClientGroup(groupId: string): ClientGroup | undefined {
    return this.clientGroups.get(groupId);
  }
  
  /**
   * List all client groups
   */
  listClientGroups(): ClientGroup[] {
    return Array.from(this.clientGroups.values());
  }
} 