import { AgencyManagementService } from '../../../services/agency';
import { AgencyGroupType } from '../../../models';

/**
 * Command result interface
 */
interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Agency commands for CLI
 */
export class AgencyCommands {
  private agencyService: AgencyManagementService;
  
  constructor(agencyService: AgencyManagementService) {
    this.agencyService = agencyService;
  }
  
  /**
   * Add agency command: >add CCN [ccn1], [ccn2], ...
   * @param args Command arguments
   */
  async addAgency(args: string[]): Promise<CommandResult> {
    if (args.length < 1) {
      return {
        success: false,
        message: 'Invalid usage. Correct syntax: >add CCN [ccn1], [ccn2], ...'
      };
    }
    
    // Check if first argument is "CCN"
    if (args[0].toLowerCase() !== 'ccn') {
      return {
        success: false,
        message: 'Invalid usage. Command must start with "CCN". Correct syntax: >add CCN [ccn1], [ccn2], ...'
      };
    }
    
    // Parse CCNs (args[1] might be a comma-separated list)
    const ccnInput = args.slice(1).join(' ');
    const ccnList = ccnInput.split(',').map(ccn => ccn.trim()).filter(ccn => ccn !== '');
    
    if (ccnList.length === 0) {
      return {
        success: false,
        message: 'No CCNs provided. Correct syntax: >add CCN [ccn1], [ccn2], ...'
      };
    }
    
    // Add each CCN
    const results = [];
    for (const ccn of ccnList) {
      try {
        // For now, use a mock API call
        const agencyData = await this.agencyService.addAgency(
          ccn,
          async (ccnToFetch) => {
            // This would be replaced with a real API call
            return {
              ccn: ccnToFetch,
              name: ccnToFetch === '123456' ? 'Valley Home Health' : `Agency ${ccnToFetch}`,
              address: '123 Main St',
              city: 'Springfield',
              state: 'IL',
              zip: '62701',
              phone: '(555) 123-4567',
              ownership: 'Non-profit',
              certificationDate: '2010-05-15'
            };
          }
        );
        
        results.push({ ccn, success: true, name: agencyData.name });
      } catch (error) {
        results.push({ ccn, success: false, error: (error as Error).message });
      }
    }
    
    // Format result message
    const successCount = results.filter(r => r.success).length;
    const resultMessages = results.map(r => {
      if (r.success) {
        return `HealthBench: Found "${r.name}" (CCN: ${r.ccn}) - Added`;
      } else {
        return `HealthBench: Failed to add CCN ${r.ccn} - ${r.error}`;
      }
    });
    
    return {
      success: successCount > 0,
      message: [
        `HealthBench: Adding agencies with CCNs: ${ccnList.join(', ')}`,
        ...resultMessages,
        `HealthBench: ${successCount} ${successCount === 1 ? 'agency' : 'agencies'} added successfully`
      ].join('\n'),
      data: results
    };
  }
  
  /**
   * Group agency command: >group-as [type] [ccn1], [ccn2], ...
   * @param args Command arguments
   */
  async groupAgency(args: string[]): Promise<CommandResult> {
    if (args.length < 2) {
      return {
        success: false,
        message: 'Invalid usage. Correct syntax: >group-as [type] [ccn1], [ccn2], ...'
      };
    }
    
    // Parse type
    const type = args[0];
    if (!['Org', 'Comp', 'Target'].includes(type)) {
      return {
        success: false,
        message: 'Invalid group type. Must be one of: Org, Comp, Target'
      };
    }
    
    // Parse CCNs
    const ccnInput = args.slice(1).join(' ');
    const ccnList = ccnInput.split(',').map(ccn => ccn.trim()).filter(ccn => ccn !== '');
    
    if (ccnList.length === 0) {
      return {
        success: false,
        message: 'No CCNs provided. Correct syntax: >group-as [type] [ccn1], [ccn2], ...'
      };
    }
    
    // Group each CCN
    const results = [];
    for (const ccn of ccnList) {
      const agency = this.agencyService.getAgency(ccn);
      
      if (!agency) {
        results.push({ ccn, success: false, error: 'Agency not found. Add the agency first with >add CCN command.' });
        continue;
      }
      
      const agencyGroup = this.agencyService.groupAgency(ccn, type as AgencyGroupType);
      
      if (agencyGroup) {
        results.push({ ccn, success: true, name: agency.name, type });
      } else {
        results.push({ ccn, success: false, error: 'Failed to group agency' });
      }
    }
    
    // Format result message
    const successCount = results.filter(r => r.success).length;
    const resultMessages = results.map(r => {
      if (r.success) {
        return `HealthBench: Agency "${r.name}" (CCN: ${r.ccn}) grouped as ${r.type}`;
      } else {
        return `HealthBench: Failed to group CCN ${r.ccn} - ${r.error}`;
      }
    });
    
    return {
      success: successCount > 0,
      message: resultMessages.join('\n'),
      data: results
    };
  }
  
  /**
   * List agencies command: >list agencies
   */
  listAgencies(): CommandResult {
    const agencies = this.agencyService.listAgencies();
    
    if (agencies.length === 0) {
      return {
        success: true,
        message: 'HealthBench: No agencies found. Add agencies with >add CCN command.'
      };
    }
    
    // Get all client groups
    const clientGroups = this.agencyService.listClientGroups();
    
    // Format table header
    const tableHeader = [
      '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━┓',
      '┃ AGENCY NAME                    ┃ CCN       ┃ TYPE        ┃',
      '┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━┩'
    ];
    
    // Format table rows
    const tableRows = agencies.map(agency => {
      // Find group type for agency
      let groupType = '';
      
      // Look for agency in all client groups
      for (const clientGroup of clientGroups) {
        const agencyGroup = clientGroup.agencies.find(a => a.agencyId === agency.ccn);
        if (agencyGroup) {
          groupType = agencyGroup.type;
          break;
        }
      }
      
      // Format row
      return `│ ${agency.name.padEnd(30)} │ ${agency.ccn.padEnd(9)} │ ${groupType.padEnd(11)} │`;
    });
    
    // Format table footer
    const tableFooter = ['└────────────────────────────────┴───────────┴─────────────┘'];
    
    // Combine all parts
    const table = [
      ...tableHeader,
      ...tableRows,
      ...tableFooter
    ].join('\n');
    
    return {
      success: true,
      message: table,
      data: agencies
    };
  }
} 