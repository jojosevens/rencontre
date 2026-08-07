/* Small helpers for Supabase auth UI (no keys committed) */
(function(){
  function $id(id){return document.getElementById(id)}
  const status = $id('status');

  function ready(){
    // Expect assets/supabase-config.js to declare window.SUPABASE_URL and window.SUPABASE_ANON_KEY
    if(!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY){ status.textContent='Veuillez créer assets/supabase-config.js (voir docs).'; return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js';
    script.onload = init;
    document.head.appendChild(script);
  }

  function init(){
    const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    $id('signup').addEventListener('click', async ()=>{
      const email = $id('su-email').value.trim();
      const password = $id('su-password').value.trim();
      if(!email||!password){ status.textContent='Email et mot de passe requis.'; return; }
      status.textContent='Inscription en cours...';
      const { user, error } = await supabase.auth.signUp({ email, password });
      if(error) status.textContent = 'Erreur: '+error.message; else status.textContent='Vérifiez votre email pour confirmer.';
    });

    $id('signin').addEventListener('click', async ()=>{
      const email = $id('si-email').value.trim();
      const password = $id('si-password').value.trim();
      if(!email||!password){ status.textContent='Email et mot de passe requis.'; return; }
      status.textContent='Connexion...';
      const { user, error } = await supabase.auth.signIn({ email, password });
      if(error) status.textContent = 'Erreur: '+error.message; else status.textContent='Connecté';
    });
  }

  document.addEventListener('DOMContentLoaded', ready);
})();
