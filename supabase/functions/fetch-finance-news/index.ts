import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();
    
    const categoryQueries: Record<string, string> = {
      stocks: "stock market OR stocks OR equity",
      "mutual-funds": "mutual funds OR investment funds",
      crypto: "cryptocurrency OR bitcoin OR ethereum"
    };

    const query = categoryQueries[category] || categoryQueries.stocks;
    const apiKey = Deno.env.get('NEWS_API_KEY');

    if (!apiKey) {
      throw new Error('NEWS_API_KEY not configured');
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=12&apiKey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
