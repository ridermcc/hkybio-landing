const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkCols() {
    const { data, error } = await supabaseAdmin.from('players').select('*').limit(1);
    if (error) {
        console.error('Error fetching players:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns in players table:', Object.keys(data[0]));
    } else {
        console.log('No players found to check columns.');
    }
}

checkCols();
