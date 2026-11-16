# Cherche & Trouve — Le Monde en Blocs

Un jeu de cherche-et-trouve dans un monde en blocs : 20 planches illustrées (10 « mondes en coupe » `n01`–`n10` et 10 « mondes à thème » `t01`–`t10`), avec une liste d'objets à retrouver, un chrono, des indices et une question bonus par niveau.

## Jouer

Ouvrir `index.html` dans un navigateur (ou via GitHub Pages).

- Pincer / molette pour zoomer, glisser pour se déplacer.
- Toucher / cliquer un objet pour le valider.
- **Indice** : montre une zone autour d'un objet (+30 s).
- **Options** : révéler les objets ou recommencer le niveau.
- La progression est enregistrée dans le navigateur (localStorage).

## Catégories

Un menu déroulant en haut de l'écran choisit la catégorie ; la liste des niveaux ne montre que ceux de la catégorie choisie.

- **Minecraft** : les 20 planches illustrées `n01`–`n10` et `t01`–`t10`.
- **Guerre stellaire** : un univers de science-fiction original en 3 planches vectorielles (`img/s01.svg`–`s03.svg`), une par faction, d'après les planches de concept du projet :
  - **Essaim Xaroth** (violet et or) : griffeuses, traqueurs, tisseuses, vers cavernicoles, colosses bio-mécaniques, nids, dans une ville en ruines ;
  - **Confédération Ælys** (blanc et orange) : vecteurs, lames-éther, gardiens, agresseurs, relais énergétiques, nexus d'ancrage, tours sentinelles, dans un marais nocturne ;
  - **Combine Valnir** (blanc, bleu et noir) : Vanguard, Talon, Auriga, Vexor, Argus, Rampart, Orbita, Lyra, Ravenix, Mantis et Bastion, dans un canyon en flammes.

- **Niveaux 4 à 13** (`img/s04.jpg`–`s13.jpg`) : des mondes spatiaux de plus en plus grands, denses et difficiles (de 6 500 à 25 000 éléments, de 15 à 25 objets à trouver), où les unités deviennent de plus en plus petites : station orbitale, base lunaire, ceinture d'astéroïdes, planète de cristal, mégapole néon, lune de glace, jungle bioluminescente, forges volcaniques, anneau-monde et vaisseau-mère. Ils sont générés par `outils/gen_stellaire_avance.js` (appelé par `gen_stellaire.js`) et rendus en JPEG avec Playwright.

Les unités sont celles des planches de concept (`outils/planches/`), découpées telles quelles en images transparentes dans `outils/unites/` par `outils/decoupe_unites.js` (nécessite le paquet `sharp`) :

```
node outils/decoupe_unites.js outils/planches outils/unites
```

Les planches de jeu sont ensuite générées par `outils/gen_stellaire.js`, qui y place ces unités, écrit les SVG et injecte la liste des objets dans `index.html` :

```
node outils/gen_stellaire.js .
```

## Contenu

- `index.html` : le jeu complet (HTML/CSS/JS, sans dépendance).
- `img/` : les planches en haute définition et leurs miniatures.
- `outils/` : le générateur des planches vectorielles.

## Progression partagée (Firebase)

Tous les joueurs partagent une seule progression, mise à jour en direct. Elle est stockée dans une Firebase Realtime Database dont l'adresse se règle en haut du script de `index.html` :

```js
const FIREBASE_URL = 'https://<projet>-default-rtdb.<région>.firebasedatabase.app';
```

Règles de la base (Realtime Database → Règles) :

```json
{
  "rules": {
    "cherchetrouve": { ".read": true, ".write": true }
  }
}
```

Si `FIREBASE_URL` est vide, la progression reste dans le navigateur.
