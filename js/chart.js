// Données des meilleurs scores (historique des générations)
let bestScoresHistory = [];

// Référence au graphique Chart.js
let ctx = document.getElementById("scoreChart").getContext("2d");
const scoreChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], // Étiquettes des générations
    datasets: [
      {
        label: "Score Moyen des 30 % Meilleurs",
        data: [],
        borderColor: "red",
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
  },
});

// Fonction pour ajouter une nouvelle génération de scores
function addNewBestScores(top30PercentPlayers) {
  if (!Array.isArray(top30PercentPlayers) || top30PercentPlayers.length === 0) return;

  // Calcul de la moyenne des scores des 30 % meilleurs joueurs
  let totalScore = top30PercentPlayers.reduce((sum, player) => sum + player.score, 0);
  let averageScore = totalScore / top30PercentPlayers.length;

  // Ajout des scores moyens à l'historique
  bestScoresHistory.push(averageScore);

  // Mise à jour des labels (numéro de génération)
  scoreChart.data.labels.push("Gen " + bestScoresHistory.length);

  // Mise à jour des données du dataset unique
  scoreChart.data.datasets[0].data.push(averageScore);

  // Rafraîchir le graphique
  scoreChart.update();
}
