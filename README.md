# doodle-jump
IMT Dev Web Doodle jump

Améliorations de l'algorithme génétique depuis la présentation orale :
1. Nouvelle méthode de reproduction : Nous sélectionnons les 30 % les plus performants de chaque génération et les ajoutons à la prochaine génération. Ensuite, pour les 70% restants, nous formons des paires parmi les 30% les meilleurs et générons un nouvel individu en faisant la moyenne de leurs poids.

3. Ajout d'une mutation aléatoire :
   Chaque nouvel individu a désormais 5 % de chance de subir une mutation aléatoire de ses poids, contrairement à l’ancienne version où tous les enfants étaient issus uniquement de mutations. Cela permet de maintenir une exploration minimale.
