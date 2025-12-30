
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

// Reemplaza estos valores con los de tu proyecto en Supabase (Settings > API)
const supabaseUrl = 'https://otaqbnxfiufpffpcltvf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YXFibnhmaXVmcGZmcGNsdHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDAzMjIsImV4cCI6MjA4MjY3NjMyMn0.HfroJsv_voVUebqubPg5GjE_heDjKdO31E6kgl1j29k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
