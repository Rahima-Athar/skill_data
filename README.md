# My Skills — Supabase setup

Run this static HTML/CSS/JavaScript app with VS Code Live Server, or run
`python -m http.server 8000` in this folder and open http://localhost:8000.

## Connect the database

1. In Supabase, open the intended project and copy its Project URL and publishable key into `supabaseUrl` and `supabaseKey` in `script.js`. Never use a secret/service-role key in browser code.
2. Check that the `public.user_skills` table exists. This app expects:

   | Column | Expected value |
   | --- | --- |
   | `id` | Database-generated unique ID |
   | `user_id` | Positive integer (the current form uses a numeric ID) |
   | `skill_name` | Text |
   | `category` | Text |
   | `proficiency_level` | Beginner, Intermediate, or Expert |
   | `years_experience` | Number, including decimals |
   | `created_at` | Timestamp with a database default of `now()` |

   If your actual schema has different names/types (for example UUID user IDs), update the form and queries to match it. A user ID referencing another table must already exist there.
3. Keep Row Level Security enabled. Ensure Data API grants and SELECT/INSERT/UPDATE/DELETE policies match the intended access model. UPDATE and DELETE also need SELECT access. Do not disable RLS or allow unrestricted public writes just to remove an error.
4. This original app has no login. Its typed User ID is a record field, **not proof of identity**. For private, per-user data, add Supabase Auth and ownership policies using `auth.uid()` and UUID user IDs before deploying. The connection fix does not change database permissions or introduce public write policies.
5. Add a skill, reload the page, edit it, search for it, then delete it. All operations now use Supabase; existing browser-local records are not automatically uploaded.

## Troubleshooting

- A library/CDN load failure prevents `window.supabase` from loading. Check your connection and browser console.
- A 404 can indicate an incorrect/unavailable project endpoint or a missing table. Verify the project URL, project status, and table in the dashboard.
- Missing-column errors mean the table does not match the names above.
- Permission/RLS errors or zero affected rows mean grants/policies or authentication need attention.
- A foreign-key error for `user_id` means the referenced user record does not exist.

## Fixes in this branch

- Use `supabase.createClient()` instead of the nonexistent `supabase.skill_data()`.
- Load database records on startup and map SQL column names to the table display.
- Send the User ID and support add, edit, delete, cancel, and search.
- Remove the conflicting local-storage data source; show database/network failures.
- Escape displayed values, avoid interpolating IDs into inline handlers, and prevent duplicate submissions.

Validation: JavaScript syntax check passed. The configured live read request returned HTTP 404 in the verification environment; end-to-end persistence still needs checking against the owner's working Supabase project. No live data or database policies were changed.

## Easy guide: pehle code kyun nahi chal raha tha?

### 1. Connection banane ka function galat tha

Pehle code mein yeh likha tha:

```js
window.supabase.skill_data(supabaseUrl, supabaseKey);
```

`skill_data` GitHub repository ka naam hai. Supabase library mein is naam ka function nahi hota. Is liye browser shuru mein hi error deta tha aur neeche wala code bhi nahi chalta tha.

Sahi code:

```js
const db = window.supabase.createClient(supabaseUrl, supabaseKey);
```

`createClient` Supabase se baat karne ke liye client banata hai. Sirf client ban jana database se successful connection ka proof nahi; actual request bhi successful honi chahiye.

### 2. Save Supabase mein, lekin list browser se aa rahi thi

Pehle list `localStorage` se load hoti thi. Yeh sirf us browser ka storage hai. Supabase mein save hua record is list mein automatically nahi aata.

Ab page khulne par `loadSkillsFromSupabase()` database se records leta hai. Add, edit aur delete ke baad list dobara load hoti hai.

### 3. Kuch functions likhe hi nahi gaye thay

Code `resetForm`, `editSkill`, `deleteSkill` aur `loadSkillsFromSupabase` use kar raha tha, lekin unki definitions nahi thi. Sirf function ka naam likhne se function nahi banta. Ab in sab ka code add hai.

### 4. Form aur database ke naam alag thay

Screen par JavaScript `skillName` use karti hai; database query `skill_name` use karti hai. Dono ko properly map karna zaroori hai. Form ka `userId` pehle save request mein ja bhi nahi raha tha. Ab `user_id` bhi send hota hai.

## Ab aap kya karein? Step by step

### Step 1 — Correct branch open karein

GitHub par branch dropdown se `fix/supabase-connection` select karein. Download ZIP karna ho to isi branch se karein. Git use kar rahe hain to:

```bash
git fetch origin
git switch fix/supabase-connection
```

VS Code mein project folder open karein. `index.html` ko Live Server se open karein. Is project ko npm install ki zaroorat nahi.

### Step 2 — Apne Supabase project ko check karein

Supabase dashboard mein correct project kholein. Agar paused hai to resume karein. Project ke Connect dialog/settings se Project URL aur publishable API key copy karein. Dashboard ke page ka URL Project URL nahi hota.

`script.js` ki pehli do values replace karein:

```js
const supabaseUrl = "https://YOUR_PROJECT_REF.supabase.co";
const supabaseKey = "YOUR_PUBLISHABLE_KEY";
```

Dono values **same Supabase project** ki honi chahiye. Publishable key browser mein use hoti hai; secret/service-role key yahan kabhi paste na karein.

### Step 3 — Table aur columns match karein

Supabase Table Editor mein `public` schema ka `user_skills` table dekhein. Upar wali table mein diye gaye column names bilkul same hone chahiye. `skillName` aur `skill_name` database ke liye alag names hain.

Agar table pehle se hai to usay delete/recreate na karein. Pehle actual column names aur types compare karein. `id` automatically generate hona chahiye aur `created_at` ka default `now()` hona chahiye, kyun ke app yeh dono values insert mein nahi bhejti.

Is form mein User ID number hai, jaise `1`. Agar database ka `user_id` UUID hai, number `1` us mein save nahi hoga. UUID wale schema ke liye login aur form/query changes chahiye. Agar numeric ID kisi users table se linked hai, to us users table mein woh ID pehle se honi chahiye.

### Step 4 — Permissions samjhein

API key project ka address/access key deti hai; woh har record ko read ya edit karne ki permission automatically nahi deti.

- **Grants:** app ko table par kaunsa kaam karne ki ijazat hai?
- **RLS policies:** kaunse user ko kaunse records par woh kaam karne ki ijazat hai?

Is app mein login abhi nahi hai. Form mein `1` likh dene se Supabase ko yeh proof nahi milta ke aap user 1 hain. Agar policies signed-in users ke liye hain, yeh current app unko satisfy nahi karegi. Is situation mein proper Supabase Auth/login aur user ownership add karni hogi. RLS off karna ya sab ko edit/delete access dena private data ka solution nahi.

Database owner ko apna intended access model choose karke grants/policies configure karni hongi. Is branch ne live database ki permissions change nahi ki hain.

### Step 5 — Browser mein asli error dekhein

Page open karein, `F12` press karein aur **Console** tab kholein. **Network** tab mein `user_skills` request par click karke Response dekhein. Error ka exact message diagnosis ke liye sirf status number se zyada useful hai.

| Error / behavior | Simple meaning | Next step |
| --- | --- | --- |
| `supabase is undefined` | Supabase library load nahi hui | Internet/CDN request check karein; HTML mein library script, `script.js` se pehle honi chahiye |
| `Invalid API key` / 401 | Key missing/incorrect ho sakti hai | Same project ka URL aur publishable key dobara copy karein; response message bhi parhein |
| 404 | Endpoint, project availability, ya table problem ho sakti hai | Exact response dekhein; URL, project status aur table check karein |
| `Could not find the table` | Table missing hai ya API ko nazar nahi aa rahi | `public.user_skills`, exposed schema aur schema cache check karein |
| Column does not exist | Query aur table ke names match nahi | Upar columns list compare karein |
| RLS / permission denied | Database ne request ki permission nahi di | Owner grants, policies aur required login check kare |
| Foreign key violation | Referenced user ID exist nahi karti | Valid existing user ID use karein |
| Invalid UUID | Numeric form aur UUID database match nahi | Schema ke mutabiq auth/form/query update karein |
| Empty list, lekin dashboard mein rows hain | SELECT policy rows hide kar sakti hai | Correct signed-in user aur SELECT policy verify karein |

### Step 6 — Chhota test karein

1. Valid User ID, `HTML`, `Technical`, `Beginner`, aur `0.5` years enter karein.
2. Add Skill press karein. Agar error aaye, pehle usay resolve karein.
3. Supabase Table Editor mein record verify karein.
4. Browser refresh karein: record dobara dikhna chahiye.
5. Edit se experience `1` karein; database mein value verify karein.
6. Search mein `HTML` likhein; phir search clear karein.
7. Delete press karein aur confirm karein; database se bhi record remove hona chahiye.

Purane localStorage records automatically Supabase mein transfer nahi kiye gaye. Successful syntax check ka matlab JavaScript parse hoti hai; iska matlab live database ke credentials/policies verify ho gaye nahi hai.

## Hardcoded config aur `.env` — easy explanation

Abhi `script.js` mein Project URL aur publishable key directly likhi hui hain. Isay hardcoding kehte hain. Project change karne par code edit karna parta hai. **Hardcoding khud original crash ki wajah nahi thi**; galat function name aur missing functions main code problems thay.

### Kya yeh key secret hai?

| Value | Browser mein allowed? | Kahan rakhein? |
| --- | --- | --- |
| Supabase Project URL | Yes | Public app configuration |
| Publishable key (`sb_publishable_...`) | Yes | Public app configuration; RLS zaroori hai |
| Legacy anon key | Yes, legacy projects mein | Public app configuration; RLS zaroori hai |
| Secret key / service-role key | Never | Backend/server environment only |
| Database password / connection string | Never | Backend/server environment only |

Is repository mein jo key thi woh `sb_publishable_...` thi. Uska browser mein nazar aana expected hai. `.env` mein rakh kar frontend build mein use karne se bhi woh browser se hide nahi hoti. Private records ki protection Auth, grants aur RLS karti hain.

### Sirf `.env` bana dena kyun kaam nahi karega?

Yeh plain HTML/JavaScript app hai; is mein abhi Vite/Next.js ya environment loader nahi hai. Browser `.env` automatically nahi parhta. `process.env.SUPABASE_URL` yahan paste karna bhi kaam nahi karega. `.env` ko HTML script tag se load ya browser se fetch na karein.

### Isi simple project mein config separate kaise karein? (optional next step)

Neeche ke steps manually apply karein; current branch abhi `script.js` ki existing config use karti hai.

1. Project root mein `config.example.js` banayein, sirf placeholders ke sath:

   ```js
   window.APP_CONFIG = {
     SUPABASE_URL: "https://YOUR_PROJECT_REF.supabase.co",
     SUPABASE_PUBLISHABLE_KEY: "YOUR_PUBLISHABLE_KEY"
   };
   ```

2. Iski copy `config.js` banayein aur apne project ka URL/publishable key fill karein. Is file mein secret keys kabhi na rakhein.
3. Root `.gitignore` file mein yeh lines add karein:

   ```gitignore
   config.js
   .env
   .env.*
   !.env.example
   ```

4. `index.html` mein scripts ka order yeh rakhein:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="config.js"></script>
   <script src="script.js"></script>
   ```

5. `script.js` mein pehli URL/key declarations replace karein:

   ```js
   const supabaseUrl = window.APP_CONFIG?.SUPABASE_URL;
   const supabaseKey = window.APP_CONFIG?.SUPABASE_PUBLISHABLE_KEY;
   if (!supabaseUrl || !supabaseKey) {
     throw new Error("Copy config.example.js to config.js and fill the public Supabase settings.");
   }
   ```

6. `config.example.js`, `.gitignore`, HTML aur code changes commit karein. `config.js` commit na karein. Agar koi file pehle tracked thi, `.gitignore` usay untrack nahi karti; `git rm --cached config.js` se sirf Git tracking remove kar sakte hain.
7. Har new developer ko example se local `config.js` banana hoga. Static hosting par deploy karte waqt bhi public `config.js` provide/generate karna hoga. Missing file hogi to app connect nahi karegi. Hosting dashboard mein env values enter karna alone plain HTML mein unko inject nahi karta.

Yeh separation setup ko manageable banati hai; browser tak bheja gaya `config.js` phir bhi publicly readable hota hai.

### Agar baad mein Vite par shift karein

Vite setup hone ke baad `.env.local` mein `VITE_SUPABASE_URL` aur `VITE_SUPABASE_PUBLISHABLE_KEY` use kar sakte hain, aur code mein `import.meta.env.VITE_SUPABASE_URL` read kar sakte hain. Yeh current plain-script setup mein directly supported nahi. `VITE_` values public build ka part banti hain; secrets ke liye backend chahiye. Hosting environment values change karne ke baad rebuild/redeploy karein.

Agar kabhi real secret key GitHub par push ho jaye, pehle usay dashboard se rotate/revoke karein. Sirf latest file se delete karne par woh purani Git history se remove nahi hoti. Publishable key ka public hona apne aap secret leak nahi hai.
