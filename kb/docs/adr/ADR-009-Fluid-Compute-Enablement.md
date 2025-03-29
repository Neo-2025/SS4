# ADR 009: Fluid Compute Enablement for SS5

## Status

Accepted

## Context

When deploying applications on Vercel, there are multiple compute configuration options that affect how serverless functions and Edge functions are provisioned and scaled. Fluid Compute is a Vercel feature that dynamically allocates computing resources based on workload demands, in contrast to fixed allocation models.

Key considerations for HealthBench include:
- The CLI-based interface requires reliable performance regardless of traffic patterns
- Command processing may have variable computational requirements
- Cost efficiency is important for the project's sustainability
- Future scaling needs must be considered from the outset

## Decision

We will enable Fluid Compute for the HealthBench project deployments on Vercel with the following specific configuration:
- Fluid Compute: Enabled
- Function CPU: Standard (1 vCPU, 1.7 GB Memory)
- Deployment Protection: Standard Protection
- Skew Protection: Enabled (12 hours)

## Consequences

### Positive
- Improved resource utilization with dynamic allocation based on actual demand
- Better cost efficiency compared to fixed provisioning, particularly during periods of variable load
- Enhanced ability to handle traffic spikes without manual intervention
- Future-proofing the infrastructure for scaling as usage grows
- Reduced risk of under-provisioning during peak usage periods

### Negative
- Potential for slight cold-start delays during periods of low activity
- Slightly more complex monitoring requirements to ensure optimal configuration
- May introduce minor additional costs if workloads exceed baseline expectations
- Requires careful monitoring during initial deployment to verify appropriate resource allocation

## Implementation Approach

1. Configure Fluid Compute via the Vercel project settings interface during initial project setup
2. Set the baseline compute resources to Standard (1 vCPU, 1.7 GB Memory) to balance performance and cost
3. Enable complementary protection settings (Deployment Protection, Skew Protection) to ensure stability
4. Document the complete configuration in the Vercel Project Setup Pattern
5. Monitor function performance metrics during initial deployment to validate the decision
6. Set up alerts for any unexpected resource consumption or performance issues
7. Review resource usage patterns after the first month of operation to determine if adjustments are needed

## Verification

The implementation has been verified in the HealthBench project settings at https://vercel.com/smart-scale/hb, where Fluid Compute has been confirmed as enabled with the specified configuration parameters.

This decision aligns with our overall architectural approach of building a scalable, efficient cloud infrastructure that can adapt to varying workloads while maintaining consistent performance for end users. 