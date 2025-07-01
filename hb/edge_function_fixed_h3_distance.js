// SS5 Enhanced H3 Smart Gravity Edge Function - FIXED H3 DISTANCE BUG
// CRITICAL FIX: h3.gridDistance() not h3.h3Distance()
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as h3 from "npm:h3-js@3.7.2";

// F_continuous distance decay (Healthcare Realistic)
function calculateSmartGravityWeight(gridSteps) {
  if (gridSteps <= 15) return 1.00; // 0-12 miles: Full weight
  if (gridSteps <= 38) return 1.00 - (gridSteps - 15) * 0.035; // 12-30 miles: 60% at 30mi
  if (gridSteps <= 76) return 0.20 - (gridSteps - 38) * 0.004; // 30-60 miles: 5% at 60mi
  if (gridSteps <= 126) return 0.05 - (gridSteps - 76) * 0.0008; // 60-100 miles: 1% at 100mi
  return 0.00; // >100 miles: Excluded
}

// BREAKTHROUGH: Modified Huff Fragment G_percent calculation per YUSS_11 rows 1-226
function calculateGPercent(gridSteps, hospitalSize, specialtyBeta) {
  const F_continuous = calculateSmartGravityWeight(gridSteps); // Distance decay
  const S_m = hospitalSize || 100; // POSbeds or specialty_multiplier  
  const beta = specialtyBeta || 1.0; // Healthcare specialty parameter
  
  // G_percent = F_continuous × (1 + LOG10(S_m × β)/50) per YUSS_11 formula
  const sizeBetaProduct = S_m * beta;
  const logComponent = sizeBetaProduct > 0 ? Math.log10(sizeBetaProduct) / 50 : 0;
  const gPercent = F_continuous * (1 + logComponent);
  
  return Math.max(0, gPercent); // Ensure non-negative
}

serve(async (req) => {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { operation, params } = body;

    // ENHANCED: Batch GIV Calculation with FIXED H3 Distance
    if (operation === "batchGivCalculation") {
      const { hospitals, materiality_threshold = 0.05, calculation_mode = 'standard' } = params;
      
      if (!hospitals || !Array.isArray(hospitals)) {
        return new Response(JSON.stringify({
          status: "error",
          message: "hospitals parameter must be an array"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      try {
        const startTime = Date.now();
        const results = [];
        let totalH3Calculations = 0;

        for (const hospital of hospitals) {
          const hospitalResult = {
            provider_id: hospital.provider_id,
            hospital_name: hospital.hospital_name,
            h3_bearing_point: hospital.h3_bearing_point,
            size_metric: hospital.size_metric,
            specialty_beta: hospital.specialty_beta || 1.0,
            processed_geozips: [],
            giv_calculations: 0,
            materiality_filtered_count: 0,
            total_territorial_population: 0
          };

          // Process each geozip for this hospital
          for (const geozip of hospital.geozip_targets) {
            try {
              // Process ALL H3 cells per geozip with population weighting
              let totalWeightedGIV = 0;
              let totalPopulation = 0;
              let h3CellCount = 0;

              // Ensure we have arrays (not JSONB objects)
              const h3Cells = Array.isArray(geozip.h3_cells) ? geozip.h3_cells : [];
              const h3Populations = Array.isArray(geozip.h3_populations) ? geozip.h3_populations : [];

              if (h3Cells.length !== h3Populations.length) {
                throw new Error(`H3 cells/populations length mismatch: ${h3Cells.length} vs ${h3Populations.length}`);
              }

              // Process each H3 cell in the geozip
              for (let i = 0; i < h3Cells.length; i++) {
                const h3Cell = h3Cells[i];
                const h3Population = h3Populations[i];

                // 🔧 CRITICAL FIX: Use h3.gridDistance() not h3.h3Distance()
                const gridSteps = h3.gridDistance(hospital.h3_bearing_point, h3Cell);
                totalH3Calculations++;

                // Calculate G_percent using Modified Huff Fragment
                const gPercent = calculateGPercent(gridSteps, hospital.size_metric, hospital.specialty_beta);

                // Calculate H3-level GIV
                const h3GIV = gPercent * h3Population;
                totalWeightedGIV += h3GIV;
                totalPopulation += h3Population;
                h3CellCount++;
              }

              // Roll up to geozip level: GIV = G_percent × pop_d_opt
              const geozipGPercent = totalPopulation > 0 ? totalWeightedGIV / totalPopulation : 0;
              const geozipGIV = geozipGPercent * geozip.pop_d_opt;

              // Apply materiality filtering (5% threshold)
              const isMaterial = geozipGPercent >= materiality_threshold;

              const geozipResult = {
                geozip_id_opt: geozip.geozip_id_opt,
                pop_d_opt: geozip.pop_d_opt,
                h3_cell_count: h3CellCount,
                avg_grid_steps: h3CellCount > 0 ? Math.round(totalWeightedGIV / h3CellCount) : 0,
                g_percent: Math.round(geozipGPercent * 10000) / 10000,
                giv_value: Math.round(geozipGIV * 10000) / 10000,
                is_material: isMaterial
              };

              hospitalResult.processed_geozips.push(geozipResult);
              hospitalResult.giv_calculations++;

              if (isMaterial) {
                hospitalResult.materiality_filtered_count++;
                hospitalResult.total_territorial_population += geozipGIV;
              }

            } catch (error) {
              hospitalResult.processed_geozips.push({
                geozip_id_opt: geozip.geozip_id_opt,
                error: error.message,
                status: 'error'
              });
            }
          }

          hospitalResult.total_territorial_population = Math.round(hospitalResult.total_territorial_population * 10000) / 10000;
          results.push(hospitalResult);
        }

        const processingTime = Date.now() - startTime;
        const totalGeozips = results.reduce((sum, h) => sum + h.giv_calculations, 0);
        const totalMaterial = results.reduce((sum, h) => sum + h.materiality_filtered_count, 0);

        // ENHANCED: Return detailed results for filtered array extraction
        return new Response(JSON.stringify({
          status: "success",
          results: results,
          summary: {
            hospitals_processed: results.length,
            total_geozip_calculations: totalGeozips,
            total_h3_calculations: totalH3Calculations,
            material_geozips: totalMaterial,
            materiality_filter_rate: Math.round(totalMaterial / totalGeozips * 100 * 100) / 100,
            processing_time_ms: processingTime,
            calculation_mode: calculation_mode,
            materiality_threshold: materiality_threshold,
            fix_applied: "h3.gridDistance() replaces h3.h3Distance()"
          }
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          status: "error",
          message: error.message,
          stack: error.stack
        }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // Calculate grid distance between two H3 cells (FIXED)
    if (operation === "gridDistance") {
      const { cell1, cell2 } = params;
      const distance = h3.gridDistance(cell1, cell2); // FIXED: was h3.h3Distance
      const distanceMiles = distance * 0.792; // Convert grid steps to miles
      
      return new Response(JSON.stringify({
        status: "success",
        gridSteps: distance,
        distanceMiles: Math.round(distanceMiles * 10) / 10,
        cell1,
        cell2
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Other operations (unchanged)...
    return new Response(JSON.stringify({
      status: "error",
      message: `Unsupported operation: ${operation}`
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: "error",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}); 