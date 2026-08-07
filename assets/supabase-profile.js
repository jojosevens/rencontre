// Supabase profile integration: uses profiles table when supabase configured, falls back to localStorage
(function(){
  const $ = id => document.getElementById(id);
  let supabase = null;

  async function loadProfile(){
    const saved = JSON.parse(localStorage.getItem('ttk_profile')||'{}');
    if(supabase){
      const user = (await supabase.auth.getUser()).data.user;
      if(user){
        // fetch from profiles table
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if(data){ $('pFirst').value = data.first_name||''; $('pLast').value = data.last_name||''; $('pAge').value = data.age||''; $('pBio').value = data.bio||''; }
      }
    }else{
      if($('pFirst')) $('pFirst').value = saved.pFirst||'';
      if($('pLast')) $('pLast').value = saved.pLast||'';
      if($('pAge')) $('pAge').value = saved.pAge||'';
      if($('pBio')) $('pBio').value = saved.pBio||'';
    }
  }

  async function saveProfile(e){
    e && e.preventDefault();
    const profile = { first_name: $('pFirst').value.trim(), last_name: $('pLast').value.trim(), age: parseInt($('pAge').value)||null, bio: $('pBio').value };
    if(supabase){
      const user = (await supabase.auth.getUser()).data.user;
      if(!user) return alert('Connectez-vous pour enregistrer votre profil.');
      // upsert
      const payload = Object.assign({ id: user.id, updated_at: new Date().toISOString() }, profile);
      const { error } = await supabase.from('profiles').upsert([payload]);
      if(error) console.error(error); else { $('profileSaved').hidden=false; setTimeout(()=>$('profileSaved').hidden=true,2000); }
    }else{
      localStorage.setItem('ttk_pFirst', profile.first_name);
      localStorage.setItem('ttk_pLast', profile.last_name);
      localStorage.setItem('ttk_pAge', profile.age);
      localStorage.setItem('ttk_pBio', profile.bio);
      $('profileSaved').hidden=false; setTimeout(()=>$('profileSaved').hidden=true,2000);
    }
  }

  document.addEventListener('supabase:ready', ()=>{ supabase = window.supabaseClient; console.info('Profile: supabase ready'); loadProfile(); });
  document.addEventListener('DOMContentLoaded', ()=>{ const form = $('profileForm'); if(form) form.addEventListener('submit', saveProfile); loadProfile(); });
})();
