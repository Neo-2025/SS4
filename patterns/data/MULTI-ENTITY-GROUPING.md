---
status: Candidate
classification: data
---

# MULTI-ENTITY-GROUPING

## Status

**Current Status**: Candidate
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 1
- Projects: 1
- Related Patterns: 2

## Classification

Data Pattern

## Problem

Applications often need to organize entities into groups based on different criteria, relationships, or business rules. Without a structured approach, these grouping mechanisms can become inconsistent across the application, making it difficult to filter, compare, and analyze related entities. Traditional hierarchical models may be too rigid for dynamic grouping needs.

## Solution

The Multi-Entity Grouping pattern provides a flexible, lightweight approach to organizing entities into logical groups without requiring complex hierarchical structures. It uses a simple relationship model where entities can be assigned to groups with different types or roles, enabling dynamic filtering and comparison while maintaining a flat, efficient data structure.

### Core Components

1. **Group Types**: Predefined categories for grouping relationships (e.g., Org, Comp, Target)
2. **Entity-Group Relationships**: Many-to-many relationships between entities and groups
3. **Group Management Service**: Service for creating, updating, and querying groups
4. **Group-based Filtering**: Mechanisms to filter entities by group membership and type

### Key Features

1. **Flexible Categorization**: Entities can belong to multiple groups with different roles
2. **Lightweight Structure**: Simple flat relationship model without complex hierarchies
3. **Dynamic Membership**: Easy to add or remove entities from groups
4. **Type-Based Organization**: Groups can have different types for specialized purposes
5. **Comparative Analysis**: Easy to compare entities across different groups

## Implementation Example

### Data Models

```typescript
/**
 * Agency group types
 */
export type AgencyGroupType = 'Org' | 'Comp' | 'Target';

/**
 * Agency group relationship model
 */
export interface AgencyGroup {
  id: string;
  agencyId: string;
  type: AgencyGroupType;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Client group model
 */
export interface ClientGroup {
  id: string;
  clientId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  agencies: AgencyGroup[];
}

/**
 * Agency with group information
 */
export interface GroupedAgency {
  ccn: string;
  name: string;
  groupType: AgencyGroupType;
  state: string;
  groupId: string;
}
```

### Management Service

```typescript
export class AgencyManagementService {
  private agencies: Map<string, AgencyData> = new Map();
  private clientGroups: Map<string, ClientGroup> = new Map();
  private agencyGroups: Map<string, AgencyGroup[]> = new Map();
  
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
}
```

### CLI Commands

```typescript
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
```

## Benefits

1. **Flexible Grouping**: Entities can belong to different groups with different types
2. **Simple Data Model**: Avoids complex hierarchical structures
3. **Comparison Support**: Makes it easy to compare entities across different groups
4. **User Control**: Allows users to organize entities based on their own criteria
5. **Efficient Filtering**: Enables filtering entities by group type or membership
6. **Logical Organization**: Provides business-meaningful organization of entities
7. **Progressive Categorization**: Allows incremental grouping as needed

## Limitations

1. **Limited Hierarchy**: Not suitable for deep hierarchical relationships
2. **Performance at Scale**: Many-to-many relationships can impact performance with very large datasets
3. **Consistency Challenges**: Maintaining consistent grouping can require additional validation logic
4. **UI Complexity**: Representing multiple groupings can be challenging in user interfaces
5. **Group Proliferation**: Without governance, groups can proliferate unnecessarily

## Related Patterns

- **TEXT-TABLE-FORMATTING**: Often used to display grouped entities in tabular format
- **CLI-COMMAND-PATTERN**: Provides commands for managing entity groups
- **DATA-MODEL-SCHEMAS**: Provides structure for the relationship models

## Usage Examples

### List Agencies with Group Information

```typescript
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
  const table = [...tableHeader, ...tableRows, ...tableFooter].join('\n');
  
  return {
    success: true,
    message: table,
    data: agencies
  };
}
```

### Filtering Entities by Group Type

```typescript
// Get agencies grouped as "Comp" (competitor)
const competitors = agencyService.listAgenciesByType('Comp');

// Analyze competitor metrics
const competitorMetrics = competitors.map(async (agency) => {
  const metrics = await metricsService.getAgencyMetrics(agency.ccn);
  return {
    agency: agency.name,
    metrics
  };
});
```

## Evolution History

- **v1.0** (Current): Initial implementation with Org/Comp/Target grouping types 