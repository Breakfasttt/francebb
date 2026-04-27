# Script de merge complet : developement -> master -> push
# Usage: ./scripts/merge-to-master.ps1

$currentBranch = git branch --show-current
Write-Host "Sauvegarde de la branche actuelle : $currentBranch" -ForegroundColor Cyan

# 1. Commit des changements sur developement si nécessaire
$status = git status --porcelain
if ($status) {
    Write-Host "Changements détectés sur $currentBranch. Commit en cours..." -ForegroundColor Yellow
    git add .
    git commit -m "Auto-commit avant merge sur master"
}

# 2. Passage sur master
Write-Host "Passage sur la branche master..." -ForegroundColor Yellow
git checkout master
git pull origin master

# 3. Merge
Write-Host "Merge de developement dans master..." -ForegroundColor Yellow
git merge developement

# 4. Push master
Write-Host "Push de master vers l'origine..." -ForegroundColor Yellow
git push origin master

# 5. Retour
Write-Host "Retour sur la branche $currentBranch..." -ForegroundColor Yellow
git checkout $currentBranch

Write-Host "Opération terminée avec succès !" -ForegroundColor Green
