param (
    [string]$message = "Auto-commit avant merge sur master"
)

# Script de merge complet : developement -> master -> push
# Usage: ./scripts/merge-to-master.ps1 -message "Mon super message"

# Configuration des noms de branches
$devBranch = "development"
$masterBranch = "master"

$currentBranch = git branch --show-current
Write-Host "Sauvegarde de la branche actuelle : $currentBranch" -ForegroundColor Cyan

# 1. Commit et Push sur la branche de développement si nécessaire
$status = git status --porcelain
if ($status) {
    Write-Host "Changements détectés sur $currentBranch. Commit & Push en cours..." -ForegroundColor Yellow
    git add .
    git commit -m $message
    git push origin $currentBranch
} else {
    Write-Host "Pas de changements locaux, vérification du push sur $currentBranch..." -ForegroundColor Gray
    git push origin $currentBranch
}

# 2. Passage sur master
Write-Host "Passage sur la branche $masterBranch..." -ForegroundColor Yellow
git checkout $masterBranch
git pull origin $masterBranch

# 3. Merge
Write-Host "Merge de $currentBranch dans $masterBranch..." -ForegroundColor Yellow
git merge $currentBranch

# 4. Push master
Write-Host "Push de $masterBranch vers l'origine..." -ForegroundColor Yellow
git push origin $masterBranch

# 5. Retour
Write-Host "Retour sur la branche $currentBranch..." -ForegroundColor Yellow
git checkout $currentBranch

Write-Host "Opération terminée avec succès !" -ForegroundColor Green
