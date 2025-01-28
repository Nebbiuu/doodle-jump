const app = new Controller(new Model(), new View());
app.Update();

document.getElementById('restart-button').addEventListener('click', () => {
    app.Restart();
});

document.getElementById('manual-button').addEventListener('click', () => {
    app.toggleAI(false);
});

document.getElementById('ai-button').addEventListener('click', () => {
    app.toggleAI(true);
});