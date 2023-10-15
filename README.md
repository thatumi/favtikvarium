# favtikvarium
A kiegészítő segítségével menteni lehet könyveket az antikvarium.hu-ról.

## Telepítés: 
(még) nincs fent add-on storeban, úgyhogy nem triviális
Chrome: chrome://extensions/ -ben engedélyezni kell a developer mode-ot, majd load unpacked és a kiegészítő gyökérkönyvtárát ki kell választani.
Firefox: about:debugging#/runtime/this-firefox -ban Load temporary add-on és a gyökérkönyvtárban lévő manifest.json fájlt kell kiválasztani.

## Használat:
Kedvencek listájának megnézése: A böngészősávban a kiegészítő ikonjára kattintva, vagy az antikvarium.hu menüjében lévő KEDVENCEIM-re kattintás (BELÉPÉS/REGISZTRÁCIÓ mellett)
Kedvencekhez adás: A könyv oldalán a cím mellett megjelenő "plusz csillag" ikonra kattintva.
Kedvencekből törlés: A könyv oldalán a cím mellett megjelenő "mínusz csillag" ikonra kattintva, vagy a kedvencek listájából is lehet.

A kiegészítő a chrome.storage API-t használja, ami azt jelenti, hogyha a felhasználó be van lépve a böngészőbe és elérhető, akkor a felhőbe fogja tárolni a kedvenceink listáját.
Használva vannak továbbá a jQuery és DataTables könyvtárak is.
