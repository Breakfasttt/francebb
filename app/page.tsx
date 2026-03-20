export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Les Tournois de Blood Bowl en France</h1>
        <p>Retrouvez tous les prochains tournois près de chez vous.</p>
      </section>

      <div className="grid">
        <div className="premium-card" style={{ padding: '2rem' }}>
          <div className="tournament-badge">PROCHAINEMENT</div>
          <h2 style={{ marginTop: '1rem' }}>Bowl des Neiges</h2>
          <p style={{ color: '#888', margin: '0.5rem 0' }}>Lieu: Lyon, France</p>
          <p style={{ color: '#888', margin: '0.5rem 0' }}>Date: 12 Janvier 2027</p>
          <p>Un tournoi épique au coeur des Alpes.</p>
        </div>

        <div className="premium-card" style={{ padding: '2rem' }}>
          <div className="tournament-badge" style={{ background: '#333' }}>PASSÉ</div>
          <h2 style={{ marginTop: '1rem' }}>Lutèce Bowl</h2>
          <p style={{ color: '#888', margin: '0.5rem 0' }}>Lieu: Paris, France</p>
          <p style={{ color: '#888', margin: '0.5rem 0' }}>Date: 15 Juin 2026</p>
          <p>Le plus grand tournoi de France.</p>
        </div>
      </div>
    </main>
  );
}
