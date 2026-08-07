# Supabase setup for THEOTOKOS (prototype)

1) Créez un projet sur https://app.supabase.com
2) Dans Settings → API, copiez:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY (ou SERVICE_ROLE_KEY si côté serveur sécurisé)
3) Dans votre dépôt, créez le fichier `assets/supabase-config.js` (ne pas committer) :

```js
// assets/supabase-config.js (DO NOT COMMIT - add to .gitignore)
window.SUPABASE_URL = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'public-anon-key';
```

4) Ouvrez `auth.html` dans le navigateur (ou servez le site) pour tester l'inscription/connexion.

Notes:
- Le prototype utilise Supabase Auth et Realtime. Pour production, remplacez par l'API Node/Express fournie dans `server/`.
- Ne mettez jamais la SERVICE_ROLE_KEY côté client.
