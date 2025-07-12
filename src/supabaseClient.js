import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kjdilsxiekbjexbgkvwi.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZGlsc3hpZWtiamV4YmdrdndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTc5MjQsImV4cCI6MjA2Nzg3MzkyNH0.5EyHoSYWGZstZL1fwqUBgnooqtdOud1dbgVE5DDFyMc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
