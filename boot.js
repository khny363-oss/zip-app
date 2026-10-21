/* זיפ · טוען את המודולים לפי הסדר. מודול חדש = שורה כאן, בלי לגעת ב-index.html */
['app.js','human.js','cloth.js','tools.js','acc.js','chat.js'].forEach(f=>{const s=document.createElement('script');s.src=f;s.async=false;document.body.appendChild(s);});
