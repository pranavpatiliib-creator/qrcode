/**
 * Scan data access helpers backed by Supabase.
 */
const { supabase } = require("../config/db");
const { env } = require("../config/env");

const DUPLICATE_ERROR_CODE = "23505";

async function create({ studentId, source }) {
  const payload = {
    student_id: studentId,
    source
  };

  const { data, error } = await supabase
    .from(env.SUPABASE_SCANS_TABLE)
    .insert(payload)
    .select("student_id, scanned_at")
    .single();

  if (error) {
    const duplicateError = new Error(error.message);
    duplicateError.code = error.code;
    duplicateError.details = error.details;
    throw duplicateError;
  }

  return {
    studentId: data.student_id,
    scannedAt: data.scanned_at
  };
}

module.exports = {
  create,
  DUPLICATE_ERROR_CODE
};
