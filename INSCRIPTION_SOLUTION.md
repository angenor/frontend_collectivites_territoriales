# 🔧 Solution : Problème d'Inscription - role_id Manquant

## 🐛 Problème

Lors de l'inscription, le backend FastAPI retourne une erreur 422 :
```json
{
  "detail": [{
    "type": "missing",
    "loc": ["body", "role_id"],
    "msg": "Field required"
  }]
}
```

Le backend **exige** un champ `role_id` mais le frontend ne l'envoie pas.

---

## ✅ Solution 1 : Créer l'endpoint `/api/v1/roles` (Recommandé)

### Étape 1 : Créer le endpoint dans le backend

Créez le fichier : `backend_collectivites_territoriales/app/api/v1/endpoints/roles.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.utilisateur import Role
from app.schemas.utilisateur import RoleResponse

router = APIRouter()

@router.get("/", response_model=List[RoleResponse])
def get_roles(
    skip: int = 0,
    limit: int = 100,
    actif_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des rôles disponibles
    """
    query = db.query(Role)

    if actif_only:
        query = query.filter(Role.actif == True)

    roles = query.offset(skip).limit(limit).all()
    return roles
```

### Étape 2 : Enregistrer le router

Dans `backend_collectivites_territoriales/app/api/v1/api.py`, ajoutez :

```python
from app.api.v1.endpoints import roles  # Ajouter cette ligne

# ...

api_router.include_router(
    roles.router,
    prefix="/roles",
    tags=["roles"]
)
```

### Étape 3 : Vérifier le schéma RoleResponse

Assurez-vous que `app/schemas/utilisateur.py` contient :

```python
class RoleResponse(BaseModel):
    id: UUID
    code: str
    nom: str
    description: Optional[str] = None
    actif: bool

    class Config:
        from_attributes = True
```

### Étape 4 : Redémarrer le backend

```bash
cd backend_collectivites_territoriales
# Ctrl+C pour arrêter
./run.sh
```

### Étape 5 : Tester

```bash
curl http://localhost:8000/api/v1/roles
```

Résultat attendu :
```json
[
  {
    "id": "...",
    "code": "LECTEUR",
    "nom": "Lecteur",
    "description": "Utilisateur en lecture seule",
    "actif": true
  },
  ...
]
```

Maintenant, l'inscription fonctionnera automatiquement ! Le frontend récupèrera le rôle LECTEUR et l'utilisera pour l'inscription.

---

## ✅ Solution 2 : Rendre role_id Optionnel dans le Backend (Alternative)

### Modifier l'endpoint d'inscription

Dans `backend_collectivites_territoriales/app/api/v1/endpoints/auth.py` (ou similaire) :

```python
from fastapi import HTTPException

@router.post("/register")
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Si role_id n'est pas fourni, utiliser le rôle LECTEUR par défaut
    if not user_data.role_id:
        lecteur_role = db.query(Role).filter(Role.code == "LECTEUR").first()
        if not lecteur_role:
            raise HTTPException(
                status_code=500,
                detail="Rôle par défaut LECTEUR introuvable"
            )
        user_data.role_id = lecteur_role.id

    # ... reste du code d'inscription
```

### Modifier le schéma UserCreate

Dans `app/schemas/utilisateur.py` :

```python
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    nom: str
    prenom: Optional[str] = None
    password: str
    telephone: Optional[str] = None
    role_id: Optional[UUID] = None  # Rendre optionnel
```

---

## ✅ Solution 3 : Workaround Temporaire (Si vous ne pouvez pas modifier le backend maintenant)

### Créer les utilisateurs via le back-office

1. Connectez-vous avec le compte admin créé dans `seed_data.sql`
2. Allez dans `/admin/utilisateurs`
3. Créez manuellement les utilisateurs avec le bon `role_id`

### Ou : Désactiver temporairement l'inscription publique

Dans `app/pages/auth/register.vue`, ajoutez un message :

```vue
<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
  <p class="text-sm text-yellow-800 dark:text-yellow-300">
    ⚠️ L'inscription publique est temporairement désactivée.
    Veuillez contacter un administrateur pour créer votre compte.
  </p>
</div>
```

---

## 📊 État Actuel

Le frontend est **déjà configuré** pour :
1. ✅ Récupérer automatiquement le rôle LECTEUR via `/api/v1/roles`
2. ✅ L'ajouter automatiquement lors de l'inscription
3. ✅ Gérer les erreurs si le rôle n'est pas trouvé

**Il ne manque que l'endpoint `/api/v1/roles` dans le backend.**

---

## 🎯 Recommandation

**Utilisez la Solution 1** : c'est la plus propre et la plus maintenable.

L'endpoint `/api/v1/roles` sera également utile pour :
- Afficher les rôles dans le back-office
- Permettre aux admins de gérer les rôles
- Attribuer des rôles aux utilisateurs

---

## 🚀 Après Correction

Une fois l'endpoint `/api/v1/roles` créé, l'inscription fonctionnera comme ceci :

1. L'utilisateur remplit le formulaire d'inscription
2. Le frontend appelle `/api/v1/roles` pour récupérer le rôle LECTEUR
3. Le frontend envoie les données + `role_id` à `/api/v1/auth/register`
4. Le compte est créé avec le rôle LECTEUR (lecture seule)
5. L'utilisateur peut se connecter et consulter les données

---

## 📞 Support

Si vous avez besoin d'aide pour implémenter ces solutions, n'hésitez pas !
