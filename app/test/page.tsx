export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Page</h1>
      <p>This is a simple test page.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}