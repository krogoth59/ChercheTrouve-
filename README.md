# Cherche & Trouve — Le Monde en Blocs

Un jeu de cherche-et-trouve dans un monde en blocs : 20 planches illustrées (10 « mondes en coupe » `n01`–`n10` et 10 « mondes à thème » `t01`–`t10`), avec une liste d'objets à retrouver, un chrono, des indices et une question bonus par niveau.

## Jouer

Ouvrir `index.html` dans un navigateur (ou via GitHub Pages).

- Pincer / molette pour zoomer, glisser pour se déplacer.
- Toucher / cliquer un objet pour le valider.
- **Indice** : montre une zone autour d'un objet (+30 s).
- **Options** : révéler les objets ou recommencer le niveau.
- La progression est enregistrée dans le navigateur (localStorage).

## Contenu

- `index.html` : le jeu complet (HTML/CSS/JS, sans dépendance).
- `img/` : les planches en haute définition et leurs miniatures.

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
