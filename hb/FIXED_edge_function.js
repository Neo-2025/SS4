import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as h3 from "npm:h3-js@3.7.2";

function calculateSmartGravityWeight(gridSteps) {
  if (gridSteps <= 15) return 1.00;
  if (gridSteps <= 38) return 1.00 - (gridSteps - 15) * 0.035;
  if (gridSteps <= 76) return 0.20 - (gridSteps - 38) * 0.004;
  if (gridSteps <= 126) return 0.05 - (gridSteps - 76) * 0.0008;
  return 0.00;
}

function calculateGPercent(gridSteps, hospitalSize, specialtyBeta) {
  const F_continuous = calculateSmartGravityWeight(gridSteps);
  const S_m = hospitalSize || 100;
  const beta = specialtyBeta || 1.0;
  const sizeBetaProduct = S_m * beta;
  const logComponent = sizeBetaProduct > 0 ? Math.log10(sizeBetaProduct) / 50 : 0;
  const gPercent = F_continuous * (1 + logComponent);
  return Math.max(0, gPercent);
}

serve(async (req) => {
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

    if (operation === "batchGivCalculation") {
      const { hospitals, materiality_threshold = 0.05 } = params;
      
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

        for (const geozip of hospital.geozip_targets) {
          try {
            let totalWeightedGIV = 0;
            let totalPopulation = 0;
            let h3CellCount = 0;

            const h3Cells = Array.isArray(geozip.h3_cells) ? geozip.h3_cells : [];
            const h3Populations = Array.isArray(geozip.h3_populations) ? geozip.h3_populations : [];

            for (let i = 0; i < h3Cells.length; i++) {
              const h3Cell = h3Cells[i];
              const h3Population = h3Populations[i];

              const gridSteps = h3.gridDistance(hospital.h3_bearing_point, h3Cell);
              totalH3Calculations++;

              const gPercent = calculateGPercent(gridSteps, hospital.size_metric, hospital.specialty_beta);
              const h3GIV = gPercent * h3Population;
              totalWeightedGIV += h3GIV;
              totalPopulation += h3Population;
              h3CellCount++;
            }

            const geozipGPercent = totalPopulation > 0 ? totalWeightedGIV / totalPopulation : 0;
            const geozipGIV = geozipGPercent * geozip.pop_d_opt;
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
          calculation_mode: "FIXED_H3_DISTANCE",
          materiality_threshold: materiality_threshold
        }
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

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