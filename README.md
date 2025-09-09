# Quiz des Kyu

Une application React moderne pour s'entraîner à reconnaître les grades de kyu d'arts martiaux sous forme de quiz à choix multiples.

## Fonctionnalités

- **Quiz bidirectionnel** : Questions du kyu vers la description ET de la description vers le kyu
- **Choix multiples** : 4 options de réponse par question
- **Pas de répétition** : Évite les questions consécutives identiques
- **Mode chronométré** : Durées configurables de 5s, 10s ou 15s
- **Statistiques en temps réel** : Précision, série actuelle et record
- **Feedback immédiat** : Affichage de la bonne réponse avec visualisation de la ceinture
- **Design moderne** : Interface avec gradient coloré et effets glassmorphism

## Correspondances des grades

- **1er kyu** : Ceinture marron + barrette (marron #8B4513)
- **2ème kyu** : Ceinture marron (marron #8B4513)
- **3ème kyu** : Ceinture verte + barrette (vert #228B22)
- **4ème kyu** : Ceinture verte (vert #228B22)
- **5ème kyu** : Ceinture jaune + barrette (jaune #FFD700)
- **6ème kyu** : Ceinture jaune (jaune #FFD700)
- **7ème kyu** : Ceinture bleu + barrette (bleu #4169E1)
- **8ème kyu** : Ceinture bleu (bleu #4169E1)
- **9ème kyu** : Ceinture orange + barrette (orange #FF8C00)
- **10ème kyu** : Ceinture orange (orange #FF8C00)

## Installation et lancement

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Technologies utilisées

- React 18 avec TypeScript
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- Hooks React (useState, useEffect, useRef, useCallback)

## Structure du projet

```
src/
├── components/
│   └── KyuGenerator.tsx    # Composant principal
├── types/
│   └── kyu.ts             # Types et données des grades
├── App.tsx                # Composant racine
├── index.tsx              # Point d'entrée
└── index.css              # Styles globaux
```
