export default function Custom404() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#f59e0b' }}>404</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>Page not found</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.75rem 1.5rem', background: '#f59e0b', color: 'black', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none' }}>Go Home</a>
      </div>
    </div>
  );
}
