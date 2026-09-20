> **Note sur la méthode de développement**
> Ce prototype a été construit avec l'assistance d'un outil de génération d'applications par IA ([Lovable](https://lovable.dev)), à partir de mes spécifications fonctionnelles et de mes exigences de sécurité. Il illustre ma capacité à **cadrer un besoin métier en cybersécurité et à piloter la construction d'un produit**, plutôt qu'un développement manuel ligne par ligne. Je suis en mesure d'expliquer l'architecture fonctionnelle, les choix de sécurité et le modèle de données ; certains détails d'implémentation du code généré n'ont pas été écrits à la main.

# Secure Score Hub — Tableau de bord de scoring sécurité (SOC)

Prototype de tableau de bord type SOC (Security Operations Center), spécifié pour centraliser un score de sécurité et des indicateurs de risque.

## Fonctionnalités spécifiées

- Backend avec politiques RLS (Row-Level Security) pour l'isolation des données par utilisateur/rôle
- Tableau de bord de suivi d'un score de sécurité
- Architecture pensée pour un contexte multi-rôles (analyste, administrateur)

## Pourquoi ce projet

Illustre l'application concrète de mes connaissances en gestion des risques et contrôle d'accès (IAM), avec un focus sur la conception des politiques d'autorisation au niveau base de données (RLS), un sujet central en Security by Design.

## Stack technique

- React, TypeScript, Vite
- Supabase (base de données, RLS, Edge Functions)
- Tailwind CSS, shadcn/ui

## Démarrage local

```bash
npm install
cp .env.example .env   # renseigner vos propres identifiants Supabase
npm run dev
```

## Sécurité

- Le fichier `.env` n'est jamais versionné (voir `.env.example`)
- Les clés Supabase utilisées côté client sont des clés publiques "anon", protégées par des règles RLS côté serveur
