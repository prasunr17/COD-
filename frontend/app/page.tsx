export default function Home() {
  return (
    <section className="space-y-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to COD MVP</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your all-in-one crypto control center
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/auth/signup" className="bg-primary text-primary-foreground px-6 py-2 rounded">
            Get Started
          </a>
          <a href="/learn" className="border px-6 py-2 rounded">
            Learn More
          </a>
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-6 py-12">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">📊 Track</h3>
          <p className="text-sm text-muted-foreground">Monitor your portfolio in real-time across all chains</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">🤖 Analyze</h3>
          <p className="text-sm text-muted-foreground">AI-powered insights and sentiment analysis</p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">💰 Transact</h3>
          <p className="text-sm text-muted-foreground">Non-custodial payments and fund flows</p>
        </div>
      </section>
    </section>
  );
}
