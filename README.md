# favtikvarium
A kiegészítő segítségével menteni lehet könyveket az antikvarium.hu-ról.

## Telepítés: 
(még) nincs fent add-on storeban, úgyhogy nem triviális
### Chrome: chrome://extensions/ -ben engedélyezni kell a developer mode-ot, majd load unpacked és a kiegészítő gyökérkönyvtárát ki kell választani.
### Firefox: about:debugging#/runtime/this-firefox -ban Load temporary add-on és a gyökérkönyvtárban lévő manifest.json fájlt kell kiválasztani.

## Használat:
### Kedvencek listájának megnézése: A böngészősávban a kiegészítő ikonjára kattintva, vagy az antikvarium.hu menüjében lévő KEDVENCEIM-re kattintás (BELÉPÉS/REGISZTRÁCIÓ mellett)
### Kedvencekhez adás: A könyv oldalán a cím mellett megjelenő "plusz csillag" ikonra kattintva.
### Kedvencekből törlés: A könyv oldalán a cím mellett megjelenő "mínusz csillag" ikonra kattintva, vagy a kedvencek listájából is lehet.

## Tárolás
A kiegészítő a chrome.storage API-t használja, ami azt jelenti, hogyha a felhasználó be van lépve a böngészőbe és elérhető, akkor a felhőbe fogja tárolni a kedvenceink listáját.

## Könyvtárak
Használva vannak továbbá a jQuery és DataTables könyvtárak is.

## Képernyőfotók

![könyvOldal](https://github.com/thatumi/favtikvarium/assets/49487499/6598c167-7125-4ac7-9b57-4da57a0a3fab)
![kedvenceimOldal](https://github.com/thatumi/favtikvarium/assets/49487499/b53011db-000e-4c04-ba72-de81ca43733d)
![böngészőSáv](https://github.com/thatumi/favtikvarium/assets/49487499/d2609e50-7926-44ed-a0a2-562a570dbff3)
