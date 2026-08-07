// Initializes Supabase client when assets/supabase-config.js is present
(function(){
  function init(){
    if(!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY){ console.warn('Supabase config not found (assets/supabase-config.js).'); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
    script.onload = ()=>{
      window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      console.info('Supabase client initialized');
      document.dispatchEvent(new Event('supabase:ready'));
    };
    document.head.appendChild(script);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
