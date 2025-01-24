const app = new Controller(new Model(), new View());
app.Update();

document.getElementById('restart-button').addEventListener('click', () => {
    app.Restart();
});